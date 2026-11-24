import { users, type sql, type Transaction } from "@platemate/db";
import {
  findActiveUserByClerkId,
  normalizeEmail,
  softDeleteUser,
  upsertUser,
} from "../src/users";

type Row = typeof users.$inferSelect;
type SQL = ReturnType<typeof sql>;

// Any use of the bare connection fails the test: every function must work on the transaction it is given.
jest.mock("../db/src/client", () => ({
  db: new Proxy(
    {},
    {
      get() {
        throw new Error("the bare connection was used");
      },
    },
  ),
}));

// In-memory fake of the query builders the helpers call. It is keyed by clerk_user_id like the real unique column.
// A `where` is read back from its parts: the bound clerk id, and whether it asks for `deleted_at is null`.
const rows = new Map<string, Row>();
// What the last upsert sent as its on-conflict `set`, so a test can assert on the update itself.
let lastConflictSet: Partial<Row> | undefined;

function readWhere(condition: SQL) {
  let text = "";
  const params: unknown[] = [];
  const walk = (chunks: unknown[]) => {
    for (const chunk of chunks) {
      if (typeof chunk !== "object" || chunk === null) continue;
      if ("queryChunks" in chunk) walk(chunk.queryChunks as unknown[]);
      else if ("encoder" in chunk && "value" in chunk) params.push(chunk.value);
      else if ("value" in chunk) text += (chunk.value as string[]).join("");
    }
  };
  walk(condition.queryChunks);
  return { clerkUserId: params[0], liveOnly: text.includes("is null") };
}

function matching(condition: SQL) {
  const { clerkUserId, liveOnly } = readWhere(condition);
  return [...rows.values()].filter(
    (row) =>
      row.clerkUserId === clerkUserId && (!liveOnly || row.deletedAt === null),
  );
}

const fakeTx = {
  insert(table: unknown) {
    expect(table).toBe(users);
    return {
      values(value: Omit<Row, "id" | "createdAt" | "deletedAt">) {
        return {
          onConflictDoUpdate(conflict: { target: unknown; set: Partial<Row> }) {
            // The upsert must be keyed by clerk_user_id, not by email or id.
            expect(conflict.target).toBe(users.clerkUserId);
            lastConflictSet = conflict.set;
            return {
              returning() {
                const existing = rows.get(value.clerkUserId);
                const row: Row = existing
                  ? { ...existing, ...conflict.set }
                  : {
                      id: crypto.randomUUID(),
                      createdAt: new Date(),
                      deletedAt: null,
                      ...value,
                    };
                rows.set(row.clerkUserId, row);
                return Promise.resolve([row]);
              },
            };
          },
        };
      },
    };
  },
  update(table: unknown) {
    expect(table).toBe(users);
    return {
      set(values: Partial<Row>) {
        return {
          where(condition: SQL) {
            for (const row of matching(condition))
              rows.set(row.clerkUserId, { ...row, ...values });
            return Promise.resolve();
          },
        };
      },
    };
  },
  select() {
    return {
      from(table: unknown) {
        expect(table).toBe(users);
        return {
          where(condition: SQL) {
            return {
              limit: () => Promise.resolve(matching(condition).slice(0, 1)),
            };
          },
        };
      },
    };
  },
};

// shortcut: a cast, because the fake implements only the builder calls the helpers make.
const tx = fakeTx as unknown as Transaction;

const ada = {
  clerkUserId: "user_ada",
  email: "Ada@Example.COM ",
  name: "Ada Lovelace",
  avatarUrl: "https://img.example/ada.png",
};

beforeEach(() => {
  rows.clear();
  lastConflictSet = undefined;
  jest.useFakeTimers({ now: new Date("2026-01-01T00:00:00Z") });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("Ada@Example.COM ")).toBe("ada@example.com");
  });
});

describe("upsertUser", () => {
  it("creates the row with a normalized email and sets updated_at", async () => {
    const user = await upsertUser(tx, ada);

    expect(user).toMatchObject({
      clerkUserId: "user_ada",
      email: "ada@example.com",
      name: "Ada Lovelace",
      avatarUrl: "https://img.example/ada.png",
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      deletedAt: null,
    });
    expect(rows.size).toBe(1);
  });

  it("called twice for the same clerkUserId keeps one record and refreshes its fields", async () => {
    const first = await upsertUser(tx, ada);
    jest.setSystemTime(new Date("2026-02-01T00:00:00Z"));
    const second = await upsertUser(tx, {
      clerkUserId: "user_ada",
      email: " ADA.L@example.com",
      name: null,
      avatarUrl: null,
    });

    expect(rows.size).toBe(1);
    expect(second.id).toBe(first.id);
    expect(second).toMatchObject({
      email: "ada.l@example.com",
      name: null,
      avatarUrl: null,
      updatedAt: new Date("2026-02-01T00:00:00Z"),
    });
    expect(second.createdAt).toEqual(first.createdAt);
  });

  it("creates the row when user.updated arrives for a person we have never seen", async () => {
    await upsertUser(tx, { ...ada, clerkUserId: "user_unknown" });

    expect(rows.get("user_unknown")?.email).toBe("ada@example.com");
  });

  it("never puts deleted_at or created_at in the on-conflict update", async () => {
    await upsertUser(tx, ada);

    expect(lastConflictSet).toBeDefined();
    expect(lastConflictSet).not.toHaveProperty("deletedAt");
    expect(lastConflictSet).not.toHaveProperty("createdAt");
  });

  it("leaves a soft-deleted person deleted and refreshes their other fields", async () => {
    await upsertUser(tx, ada);
    jest.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    await softDeleteUser(tx, "user_ada");
    jest.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const user = await upsertUser(tx, { ...ada, name: "Ada King" });

    expect(user.deletedAt).toEqual(new Date("2026-03-01T00:00:00Z"));
    expect(rows.get("user_ada")).toMatchObject({
      name: "Ada King",
      deletedAt: new Date("2026-03-01T00:00:00Z"),
    });
    expect(await findActiveUserByClerkId(tx, "user_ada")).toBeNull();
  });
});

describe("when the transaction fails", () => {
  const failure = new Error("connection lost");
  const rejecting = Promise.reject(failure);
  rejecting.catch(() => undefined);
  const failingTx = {
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => ({ returning: () => rejecting }),
      }),
    }),
    update: () => ({ set: () => ({ where: () => rejecting }) }),
    select: () => ({
      from: () => ({ where: () => ({ limit: () => rejecting }) }),
    }),
  } as unknown as Transaction;

  it("upsertUser rejects with the same error", async () => {
    await expect(upsertUser(failingTx, ada)).rejects.toBe(failure);
  });

  it("softDeleteUser rejects with the same error", async () => {
    await expect(softDeleteUser(failingTx, "user_ada")).rejects.toBe(failure);
  });

  it("findActiveUserByClerkId rejects with the same error", async () => {
    await expect(findActiveUserByClerkId(failingTx, "user_ada")).rejects.toBe(
      failure,
    );
  });
});

describe("softDeleteUser", () => {
  it("sets deleted_at and keeps the row", async () => {
    await upsertUser(tx, ada);
    jest.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    await softDeleteUser(tx, "user_ada");

    expect(rows.size).toBe(1);
    expect(rows.get("user_ada")?.deletedAt).toEqual(
      new Date("2026-03-01T00:00:00Z"),
    );
  });

  it("does nothing for an unknown id", async () => {
    await softDeleteUser(tx, "user_unknown");

    expect(rows.size).toBe(0);
  });

  it("deletes only the named person", async () => {
    await upsertUser(tx, ada);
    await upsertUser(tx, { ...ada, clerkUserId: "user_grace" });
    await softDeleteUser(tx, "user_ada");

    expect(rows.get("user_ada")?.deletedAt).not.toBeNull();
    expect(rows.get("user_grace")?.deletedAt).toBeNull();
  });

  it("keeps the first deleted_at when the event is delivered twice", async () => {
    await upsertUser(tx, ada);
    jest.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    await softDeleteUser(tx, "user_ada");
    jest.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    await softDeleteUser(tx, "user_ada");

    expect(rows.get("user_ada")?.deletedAt).toEqual(
      new Date("2026-03-01T00:00:00Z"),
    );
  });
});

describe("findActiveUserByClerkId", () => {
  it("returns the live user", async () => {
    await upsertUser(tx, ada);

    expect(await findActiveUserByClerkId(tx, "user_ada")).toMatchObject({
      clerkUserId: "user_ada",
    });
  });

  it("returns only the asked-for person, not another live one", async () => {
    await upsertUser(tx, ada);
    await upsertUser(tx, { ...ada, clerkUserId: "user_grace" });

    expect(await findActiveUserByClerkId(tx, "user_grace")).toMatchObject({
      clerkUserId: "user_grace",
    });
  });

  it("returns null for an unknown or soft-deleted user", async () => {
    await upsertUser(tx, ada);
    await softDeleteUser(tx, "user_ada");

    expect(await findActiveUserByClerkId(tx, "user_ada")).toBeNull();
    expect(await findActiveUserByClerkId(tx, "user_unknown")).toBeNull();
  });
});

import type { sql } from "@platemate/db";

// A fake transaction: records what the helper sends, in order, as the driver would see it (text plus parameters),
// and mimics the drivers' commit and rollback. No database is touched.
type Event =
  | { kind: "begin" | "commit" | "rollback" }
  | { kind: "statement"; sql: string; params: unknown[] }
  | { kind: "work" };

const events: Event[] = [];

// Renders a drizzle `sql` template the way a driver receives it: text with $n placeholders, plus the values.
// A literal part is a chunk with a `value` string array; anything else is a bound parameter.
function render(query: ReturnType<typeof sql>) {
  let text = "";
  const params: unknown[] = [];
  for (const chunk of query.queryChunks) {
    if (typeof chunk === "object" && chunk !== null && "value" in chunk) {
      text += (chunk.value as string[]).join("");
    } else {
      params.push(chunk);
      text += `$${params.length}`;
    }
  }
  return { sql: text, params };
}

const fakeTx = {
  execute(query: ReturnType<typeof sql>) {
    events.push({ kind: "statement", ...render(query) });
    return Promise.resolve([]);
  },
};

jest.mock("../db/src/client", () => ({
  db: {
    async transaction(callback: (tx: typeof fakeTx) => Promise<unknown>) {
      events.push({ kind: "begin" });
      try {
        const result = await callback(fakeTx);
        events.push({ kind: "commit" });
        return result;
      } catch (error) {
        events.push({ kind: "rollback" });
        throw error;
      }
    },
  },
}));

import { withSyncContext, withUserContext } from "../db/src/with-context";

const statements = () =>
  events.flatMap((e) => (e.kind === "statement" ? [e] : []));

beforeEach(() => {
  events.length = 0;
});

describe("withUserContext", () => {
  it("drops to platemate_app and sets the user id before running the work", async () => {
    const result = await withUserContext("user_123", () => {
      events.push({ kind: "work" });
      return Promise.resolve("done");
    });

    expect(result).toBe("done");
    expect(events.map((e) => e.kind)).toEqual([
      "begin",
      "statement",
      "statement",
      "work",
      "commit",
    ]);
    expect(statements()[0].sql).toBe("set local role platemate_app");
    expect(statements()[1]).toEqual({
      kind: "statement",
      sql: "select set_config('app.clerk_user_id', $1, true)",
      params: ["user_123"],
    });
  });

  it("passes the id as a parameter and never builds it into the SQL text", async () => {
    const hostile = "x'); drop table users; --";
    await withUserContext(hostile, () => Promise.resolve());

    for (const s of statements()) expect(s.sql).not.toContain(hostile);
    expect(statements()[1].params).toEqual([hostile]);
  });

  it("hands the transaction to the work", async () => {
    let received: unknown;
    await withUserContext("user_123", (tx) => {
      received = tx;
      return Promise.resolve();
    });
    expect(received).toBe(fakeTx);
  });

  it.each([
    ["an empty string", ""],
    ["only whitespace", "   "],
    ["undefined", undefined],
    ["null", null],
  ])("rejects %s without opening a transaction", async (_name, id) => {
    const work = jest.fn(() => Promise.resolve());
    await expect(
      withUserContext(id as unknown as string, work),
    ).rejects.toThrow(/clerk user id/i);
    expect(work).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it("rolls back and rethrows when the work throws", async () => {
    const boom = new Error("boom");
    await expect(
      withUserContext("user_123", () => Promise.reject(boom)),
    ).rejects.toBe(boom);
    expect(events.map((e) => e.kind)).toEqual([
      "begin",
      "statement",
      "statement",
      "rollback",
    ]);
  });
});

describe("when a setup statement fails", () => {
  it.each([
    ["set local role", 0],
    ["the setting", 1],
  ])("never runs the work and rolls back if %s fails", async (_n, failAt) => {
    const original = fakeTx.execute.bind(fakeTx);
    let calls = 0;
    const failure = new Error("permission denied");
    fakeTx.execute = (query) => {
      if (calls++ === failAt) return Promise.reject(failure);
      return original(query);
    };
    const work = jest.fn(() => Promise.resolve());
    try {
      await expect(withUserContext("user_123", work)).rejects.toBe(failure);
      calls = 0;
      await expect(withSyncContext(work)).rejects.toBe(failure);
    } finally {
      fakeTx.execute = original;
    }
    expect(work).not.toHaveBeenCalled();
    expect(events.filter((e) => e.kind === "rollback")).toHaveLength(2);
    expect(events.some((e) => e.kind === "commit")).toBe(false);
  });
});

describe("withSyncContext", () => {
  it("drops to platemate_app and sets only app.actor before running the work", async () => {
    const result = await withSyncContext(() => {
      events.push({ kind: "work" });
      return Promise.resolve(42);
    });

    expect(result).toBe(42);
    expect(events.map((e) => e.kind)).toEqual([
      "begin",
      "statement",
      "statement",
      "work",
      "commit",
    ]);
    expect(statements()[0].sql).toBe("set local role platemate_app");
    expect(statements()[1]).toEqual({
      kind: "statement",
      sql: "select set_config('app.actor', $1, true)",
      params: ["clerk-sync"],
    });
    expect(statements().some((s) => s.sql.includes("clerk_user_id"))).toBe(
      false,
    );
  });

  it("rolls back and rethrows when the work throws", async () => {
    const boom = new Error("boom");
    await expect(withSyncContext(() => Promise.reject(boom))).rejects.toBe(
      boom,
    );
    expect(events.at(-1)).toEqual({ kind: "rollback" });
  });
});

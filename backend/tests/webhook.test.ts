// Spec-first tests for POST /webhooks/clerk (T022, with the T023 getUser checks), written from
// specs/001-user-auth/contracts/api.md before the handler exists. Everything outside the handler is mocked:
// signature check, Clerk API, database context and the users helpers. No network, secret or database is used.

type Profile = {
  clerkUserId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};
type StoredUser = Profile & { deletedAt: Date | null };

const mockVerifyWebhook = jest.fn<Promise<unknown>, [Request, unknown?]>();
const mockGetUser = jest.fn<Promise<unknown>, [string]>();
const mockWithSyncContext = jest.fn<
  Promise<unknown>,
  [(tx: unknown) => Promise<unknown>]
>();
const mockUpsertUser = jest.fn<Promise<StoredUser>, [unknown, Profile]>();
const mockSoftDeleteUser = jest.fn<Promise<void>, [unknown, string]>();

// The factories only hold thin wrappers, so `resetAllMocks` in `beforeEach` cannot break a client that the
// handler might create when its module loads.
jest.mock("@clerk/backend/webhooks", () => ({
  verifyWebhook: (...args: [Request, unknown?]) => mockVerifyWebhook(...args),
}));
jest.mock("@clerk/backend", () => ({
  createClerkClient: () => ({
    users: { getUser: (id: string) => mockGetUser(id) },
  }),
}));
jest.mock("@platemate/db", () => ({
  withSyncContext: (fn: (tx: unknown) => Promise<unknown>) =>
    mockWithSyncContext(fn),
}));
jest.mock("../src/users", () => ({
  upsertUser: (tx: unknown, profile: Profile) => mockUpsertUser(tx, profile),
  softDeleteUser: (tx: unknown, id: string) => mockSoftDeleteUser(tx, id),
}));

const tx = { fake: "transaction" };
// Fake store keyed by clerk id, like the real unique column. `insideSync` shows a write ran inside withSyncContext.
const store = new Map<string, StoredUser>();
let insideSync = false;
const writesOutsideSync: string[] = [];

type Webhook = (typeof import("../src/webhooks/clerk"))["clerkWebhook"];
let clerkWebhook: Webhook;

beforeAll(async () => {
  // Dummy values: the handler reads them through getEnv, which caches on first use.
  process.env.CLERK_SECRET_KEY = "sk_test_dummy";
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_dummy";
  process.env.CLERK_PUBLISHABLE_KEY = "pk_test_dummy";
  process.env.APP_URL = "http://localhost:3000";
  ({ clerkWebhook } = await import("../src/webhooks/clerk"));
});

beforeEach(() => {
  jest.resetAllMocks();
  store.clear();
  insideSync = false;
  writesOutsideSync.length = 0;

  mockWithSyncContext.mockImplementation(async (fn) => {
    insideSync = true;
    try {
      return await fn(tx);
    } finally {
      insideSync = false;
    }
  });
  mockUpsertUser.mockImplementation((_tx, profile) => {
    if (!insideSync) writesOutsideSync.push(`upsert ${profile.clerkUserId}`);
    const user = {
      ...profile,
      deletedAt: store.get(profile.clerkUserId)?.deletedAt ?? null,
    };
    store.set(profile.clerkUserId, user);
    return Promise.resolve(user);
  });
  mockSoftDeleteUser.mockImplementation((_tx, id) => {
    if (!insideSync) writesOutsideSync.push(`delete ${id}`);
    const user = store.get(id);
    if (user && !user.deletedAt)
      store.set(id, { ...user, deletedAt: new Date() });
    return Promise.resolve();
  });
  // By default Clerk still knows the user.
  mockGetUser.mockResolvedValue({ id: "user_ada" });
});

function userData(overrides: Record<string, unknown> = {}) {
  return {
    id: "user_ada",
    email_addresses: [{ id: "idn_1", email_address: "Ada@Example.com" }],
    primary_email_address_id: "idn_1",
    first_name: "Ada",
    last_name: "Lovelace",
    image_url: "https://img.example/ada.png",
    ...overrides,
  };
}

const created = (data = userData()) => ({ type: "user.created", data });
const updated = (data = userData()) => ({ type: "user.updated", data });
const deleted = (id = "user_ada") => ({ type: "user.deleted", data: { id } });

// The signature check is mocked, so what verifyWebhook resolves to is the verified event.
async function deliver(event: unknown) {
  mockVerifyWebhook.mockResolvedValue(event);
  return post(JSON.stringify(event));
}

function post(body: string) {
  return clerkWebhook.request("/webhooks/clerk", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "svix-id": "msg_1",
      "svix-timestamp": "1700000000",
      "svix-signature": "v1,dummy",
    },
    body,
  });
}

const ok = { ok: true };
const nothingWritten = () => {
  expect(mockUpsertUser).not.toHaveBeenCalled();
  expect(mockSoftDeleteUser).not.toHaveBeenCalled();
  expect(store.size).toBe(0);
};

describe("POST /webhooks/clerk with a valid signature", () => {
  it("user.created upserts once inside withSyncContext and answers 200 {ok:true}", async () => {
    const res = await deliver(created());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ok);
    expect(mockUpsertUser).toHaveBeenCalledTimes(1);
    expect(mockUpsertUser).toHaveBeenCalledWith(tx, {
      clerkUserId: "user_ada",
      email: "Ada@Example.com",
      name: "Ada Lovelace",
      avatarUrl: "https://img.example/ada.png",
    });
    expect(writesOutsideSync).toEqual([]);
    expect(mockSoftDeleteUser).not.toHaveBeenCalled();
  });

  it("checks the signature with the configured signing secret", async () => {
    await deliver(created());

    expect(mockVerifyWebhook).toHaveBeenCalledTimes(1);
    expect(mockVerifyWebhook.mock.calls[0][1]).toMatchObject({
      signingSecret: "whsec_dummy",
    });
  });

  it("takes the primary email, not the first one listed", async () => {
    await deliver(
      created(
        userData({
          email_addresses: [
            { id: "idn_old", email_address: "old@example.com" },
            { id: "idn_2", email_address: "new@example.com" },
          ],
          primary_email_address_id: "idn_2",
        }),
      ),
    );

    expect(store.get("user_ada")?.email).toBe("new@example.com");
  });

  it("the same user.created delivered twice leaves one record and answers 200 both times", async () => {
    const first = await deliver(created());
    const second = await deliver(created());

    expect([first.status, second.status]).toEqual([200, 200]);
    expect(store.size).toBe(1);
    expect(store.get("user_ada")?.email).toBe("Ada@Example.com");
  });

  it("user.updated refreshes the stored profile", async () => {
    await deliver(created());
    const res = await deliver(
      updated(
        userData({
          first_name: "Ada",
          last_name: "King",
          image_url: "https://img.example/ada2.png",
        }),
      ),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ok);
    expect(store.size).toBe(1);
    expect(store.get("user_ada")).toMatchObject({
      name: "Ada King",
      avatarUrl: "https://img.example/ada2.png",
    });
    expect(writesOutsideSync).toEqual([]);
  });

  it("user.deleted soft-deletes inside withSyncContext and keeps the record", async () => {
    await deliver(created());
    const res = await deliver(deleted());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ok);
    expect(mockSoftDeleteUser).toHaveBeenCalledTimes(1);
    expect(mockSoftDeleteUser).toHaveBeenCalledWith(tx, "user_ada");
    expect(store.get("user_ada")?.deletedAt).toBeInstanceOf(Date);
    expect(writesOutsideSync).toEqual([]);
  });

  it("user.deleted for a person we never stored still answers 200", async () => {
    const res = await deliver(deleted("user_unknown"));

    expect(res.status).toBe(200);
    expect(store.size).toBe(0);
  });

  it.each(["email.created", "session.created", "organization.created"])(
    "ignores %s: 200 {ok:true} and writes nothing",
    async (type) => {
      const res = await deliver({ type, data: { id: "evt_1" } });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(ok);
      nothingWritten();
    },
  );
});

describe("POST /webhooks/clerk with a bad request", () => {
  it("answers 400 {error:'invalid webhook'} and writes nothing when the signature check fails", async () => {
    mockVerifyWebhook.mockRejectedValue(new Error("No matching signature"));

    const res = await post(JSON.stringify(created()));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid webhook" });
    nothingWritten();
  });

  it("answers the same 400 when the check rejects with something that is not an Error", async () => {
    mockVerifyWebhook.mockRejectedValue("bad");

    const res = await post(JSON.stringify(created()));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid webhook" });
    nothingWritten();
  });

  it("does not echo the signing secret or the error detail in the 400 body", async () => {
    mockVerifyWebhook.mockRejectedValue(new Error("secret whsec_dummy leaked"));

    const res = await post(JSON.stringify(created()));

    const text = await res.text();
    expect(text).not.toContain("whsec_dummy");
    expect(text).not.toContain("leaked");
  });

  it("answers 400 and writes nothing for user.created with no primary email", async () => {
    const res = await deliver(
      created(userData({ primary_email_address_id: null })),
    );

    expect(res.status).toBe(400);
    nothingWritten();
  });

  it("answers 400 and writes nothing for user.created whose primary id matches no address", async () => {
    const res = await deliver(
      created(userData({ primary_email_address_id: "idn_missing" })),
    );

    expect(res.status).toBe(400);
    nothingWritten();
  });

  it("answers 400 and writes nothing for a user event with no user id", async () => {
    const res = await deliver(created(userData({ id: "" })));

    expect(res.status).toBe(400);
    nothingWritten();
  });
});

describe("POST /webhooks/clerk when the database write fails", () => {
  it.each([
    ["user.created", created()],
    ["user.updated", updated()],
    ["user.deleted", deleted()],
  ])("answers 500 for %s so Clerk retries", async (_type, event) => {
    mockUpsertUser.mockRejectedValue(new Error("connection lost"));
    mockSoftDeleteUser.mockRejectedValue(new Error("connection lost"));

    const res = await deliver(event);

    expect(res.status).toBe(500);
    expect(store.size).toBe(0);
  });

  it("answers 500 when withSyncContext itself fails", async () => {
    mockWithSyncContext.mockRejectedValue(new Error("cannot connect"));

    const res = await deliver(created());

    expect(res.status).toBe(500);
    expect(store.size).toBe(0);
  });

  it("does not leak the database error text in the 500 body", async () => {
    mockUpsertUser.mockRejectedValue(
      new Error("password authentication failed for user platemate_app"),
    );

    const res = await deliver(created());

    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("platemate_app");
  });
});

describe("user.created for an account Clerk has already deleted", () => {
  // Shape of Clerk's API error for an unknown id: status 404, error code resource_not_found.
  const gone = Object.assign(new Error("Not Found"), {
    status: 404,
    errors: [{ code: "resource_not_found", message: "Not Found" }],
  });

  it("asks Clerk about the id in the event", async () => {
    await deliver(created());

    expect(mockGetUser).toHaveBeenCalledWith("user_ada");
  });

  it("answers 200 and does not insert when Clerk says the user is gone (404)", async () => {
    mockGetUser.mockRejectedValue(gone);

    const res = await deliver(created());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ok);
    expect(mockUpsertUser).not.toHaveBeenCalled();
    expect(store.size).toBe(0);
  });

  it("a retried user.created after user.deleted leaves no live row", async () => {
    await deliver(created());
    await deliver(deleted());
    mockGetUser.mockRejectedValue(gone);
    const res = await deliver(created());

    expect(res.status).toBe(200);
    expect(store.get("user_ada")?.deletedAt).toBeInstanceOf(Date);
  });

  it.each([
    [
      "a 500 from Clerk",
      Object.assign(new Error("Server error"), { status: 500 }),
    ],
    ["a 429 from Clerk", Object.assign(new Error("Too many"), { status: 429 })],
    ["a network failure", new Error("fetch failed")],
  ])(
    "answers 500 and writes nothing on %s, so Clerk retries",
    async (_name, failure) => {
      mockGetUser.mockRejectedValue(failure);

      const res = await deliver(created());

      expect(res.status).toBe(500);
      nothingWritten();
    },
  );
});

describe("POST /webhooks/clerk with a handled event type and a malformed payload", () => {
  it.each([
    [
      "user.updated with no primary email",
      updated(userData({ primary_email_address_id: null })),
    ],
    ["user.updated with no user id", updated(userData({ id: "   " }))],
    ["user.deleted with no id", { type: "user.deleted", data: {} }],
    ["user.deleted with a blank id", deleted("  ")],
    ["user.created with no data", { type: "user.created" }],
  ])("answers 400 and writes nothing for %s", async (_name, event) => {
    const res = await deliver(event);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid webhook" });
    nothingWritten();
    expect(mockGetUser).not.toHaveBeenCalled();
  });
});

describe("POST /webhooks/clerk when the signing secret is not configured", () => {
  it("fails with 500, checks nothing and writes nothing", async () => {
    const saved = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    try {
      // A fresh module registry gives a fresh getEnv cache, so the missing variable is seen.
      let fresh!: Webhook;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const loaded = require("../src/webhooks/clerk") as {
          clerkWebhook: Webhook;
        };
        fresh = loaded.clerkWebhook;
      });
      mockVerifyWebhook.mockResolvedValue(created());

      const res = await fresh.request("/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(created()),
      });

      expect(res.status).toBe(500);
      expect(mockVerifyWebhook).not.toHaveBeenCalled();
      nothingWritten();
    } finally {
      process.env.CLERK_WEBHOOK_SIGNING_SECRET = saved;
      errorSpy.mockRestore();
    }
  });
});

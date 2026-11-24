import { parseAppUrl, parseEnv } from "../src/env";

const valid = {
  CLERK_PUBLISHABLE_KEY: "pk-anything",
  CLERK_SECRET_KEY: "sk-anything",
  CLERK_WEBHOOK_SIGNING_SECRET: "whsec-anything",
  APP_URL: "http://localhost:3000",
};

const names = Object.keys(valid) as (keyof typeof valid)[];

function messageOf(source: Record<string, string | undefined>): string {
  try {
    parseEnv(source);
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("parseEnv did not throw");
}

describe("parseEnv", () => {
  it("returns the four variables for valid input and ignores the rest", () => {
    expect(parseEnv({ ...valid, UNRELATED: "x" })).toEqual(valid);
  });

  it("accepts an https APP_URL and keys without a Clerk prefix", () => {
    expect(
      parseEnv({ ...valid, APP_URL: "https://platemate.example" }).APP_URL,
    ).toBe("https://platemate.example");
  });

  it.each(names)("fails naming %s when it is missing", (name) => {
    expect(messageOf({ ...valid, [name]: undefined })).toContain(name);
  });

  it.each(names)("fails naming %s when it is empty", (name) => {
    expect(messageOf({ ...valid, [name]: "" })).toContain(name);
  });

  it.each(names)("fails naming %s when it is whitespace only", (name) => {
    expect(messageOf({ ...valid, [name]: "   " })).toContain(name);
  });

  it.each(["not a url", "ftp://example.com", "javascript:alert(1)"])(
    "fails naming APP_URL for %s",
    (bad) => {
      expect(messageOf({ ...valid, APP_URL: bad })).toContain("APP_URL");
    },
  );

  it("trims surrounding whitespace from valid values", () => {
    expect(parseEnv({ ...valid, CLERK_SECRET_KEY: "  sk-x  " })).toMatchObject({
      CLERK_SECRET_KEY: "sk-x",
    });
  });

  it("names every problem at once", () => {
    const message = messageOf({});
    for (const name of names) expect(message).toContain(name);
  });

  it("never prints values, even for a bad APP_URL next to a set secret", () => {
    const secret = "sk-SUPER-SECRET-VALUE-123";
    const badUrl = "ftp://leaky-host.example/SECRET-PATH";
    const message = messageOf({
      ...valid,
      CLERK_SECRET_KEY: secret,
      APP_URL: badUrl,
    });
    expect(message).toContain("APP_URL");
    expect(message).not.toContain(secret);
    expect(message).not.toContain(badUrl);
    expect(message).not.toContain("leaky-host");
  });
});

describe("parseAppUrl", () => {
  it("returns a valid http(s) URL and needs no other variable", () => {
    expect(parseAppUrl("https://platemate.example")).toBe(
      "https://platemate.example",
    );
  });

  it.each([undefined, "", "   "])("says APP_URL is missing for %p", (bad) => {
    expect(() => parseAppUrl(bad)).toThrow(
      "Invalid environment variables: APP_URL is missing",
    );
  });

  it("says APP_URL is not a valid http(s) URL, without echoing the value", () => {
    expect(() => parseAppUrl("ftp://leaky-host.example")).toThrow(
      "Invalid environment variables: APP_URL is not a valid http(s) URL",
    );
  });
});

describe("getEnv", () => {
  const saved = { ...process.env };

  afterEach(() => {
    for (const key of Object.keys(process.env)) delete process.env[key];
    Object.assign(process.env, saved);
  });

  // A fresh module copy per call, so the cache from one test never leaks into the next.
  async function freshGetEnv(): Promise<
    (typeof import("../src/env"))["getEnv"]
  > {
    let mod: typeof import("../src/env") | undefined;
    await jest.isolateModulesAsync(async () => {
      mod = await import("../src/env");
    });
    if (!mod) throw new Error("env module did not load");
    return mod.getEnv;
  }

  it("reads process.env on the first call and returns the same values after", async () => {
    Object.assign(process.env, valid);
    const getEnv = await freshGetEnv();
    expect(getEnv()).toEqual(valid);

    process.env.APP_URL = "http://changed.example";
    expect(getEnv().APP_URL).toBe(valid.APP_URL);
  });

  it("throws naming the missing variable, and importing the module did not throw", async () => {
    for (const name of names) delete process.env[name];
    const getEnv = await freshGetEnv();
    expect(() => getEnv()).toThrow(/CLERK_SECRET_KEY/);
  });

  it("does not cache a failure: a later call succeeds once the variables are set", async () => {
    for (const name of names) delete process.env[name];
    const getEnv = await freshGetEnv();
    expect(() => getEnv()).toThrow();

    Object.assign(process.env, valid);
    expect(getEnv()).toEqual(valid);
  });
});

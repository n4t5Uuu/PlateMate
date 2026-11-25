import {
  failureCode,
  grantMembership,
  grantPrivileges,
  resolveTarget,
  type Inspect,
} from "../db/src/apply";
import { GRANT_PRIVILEGES } from "../db/src/verify-rls";

type Sql = Parameters<typeof grantPrivileges>[0];

// postgres is ESM-only and Jest here runs CommonJS, so the host check is a fake that reads the hostname;
// the real guard (`isLocalConnection`) is covered by local-database.test.ts.
const inspect: Inspect = (url) => {
  if (!URL.canParse(url)) return Promise.resolve(undefined);
  const host = new URL(url).hostname;
  return Promise.resolve({
    host,
    local: host === "localhost" || host === "127.0.0.1",
  });
};

const NEON_URL = "postgresql://owner:s3cretpw@ep-cool-123.neon.tech/neondb";
const neonEnv = { DATABASE_URL_UNPOOLED: NEON_URL };

describe("resolveTarget local", () => {
  it("targets the docker database and ignores the environment", async () => {
    const target = await resolveTarget(["local"], neonEnv, inspect);
    expect(target).toMatchObject({
      ok: true,
      url: "postgresql://platemate:platemate@localhost:5432/platemate",
      host: "localhost",
    });
  });

  it("ignores DATABASE_URL too", async () => {
    const target = await resolveTarget(
      ["local"],
      { DATABASE_URL: NEON_URL },
      inspect,
    );
    expect(target.ok && target.url).toContain("localhost");
  });
});

describe("resolveTarget neon", () => {
  it("refuses without --yes", async () => {
    const target = await resolveTarget(["neon"], neonEnv, inspect);
    expect(target).toMatchObject({ ok: false });
    expect(!target.ok && target.error).toMatch(/--yes/);
  });

  it("uses the direct URL with --yes, and the host in the label", async () => {
    const target = await resolveTarget(["neon", "--yes"], neonEnv, inspect);
    expect(target).toMatchObject({
      ok: true,
      url: NEON_URL,
      host: "ep-cool-123.neon.tech",
    });
  });

  it("accepts --yes before the target", async () => {
    const target = await resolveTarget(["--yes", "neon"], neonEnv, inspect);
    expect(target.ok).toBe(true);
  });

  it("falls back to DATABASE_URL when there is no direct URL", async () => {
    const target = await resolveTarget(
      ["neon", "--yes"],
      { DATABASE_URL: NEON_URL },
      inspect,
    );
    expect(target.ok && target.url).toBe(NEON_URL);
  });

  it("prefers the direct URL over the pooled one", async () => {
    const target = await resolveTarget(
      ["neon", "--yes"],
      { ...neonEnv, DATABASE_URL: "postgresql://u:p@pooler.neon.tech/db" },
      inspect,
    );
    expect(target.ok && target.url).toBe(NEON_URL);
  });

  it("names the branch in the label when NEON_BRANCH is set", async () => {
    const target = await resolveTarget(
      ["neon", "--yes"],
      { ...neonEnv, NEON_BRANCH: "dev" },
      inspect,
    );
    expect(target.ok && target.label).toContain("dev");
  });

  it.each([
    "postgresql://u:pw@localhost:5432/db",
    "postgres://u:pw@127.0.0.1/db",
  ])("refuses a local URL: %s", async (url) => {
    const target = await resolveTarget(
      ["neon", "--yes"],
      { DATABASE_URL_UNPOOLED: url },
      inspect,
    );
    expect(target.ok).toBe(false);
  });

  it("refuses when no URL is set", async () => {
    expect((await resolveTarget(["neon", "--yes"], {}, inspect)).ok).toBe(
      false,
    );
  });

  it("refuses an unparsable URL without echoing it", async () => {
    const target = await resolveTarget(
      ["neon", "--yes"],
      { DATABASE_URL_UNPOOLED: "not a url s3cretpw" },
      inspect,
    );
    expect(target.ok).toBe(false);
    expect(JSON.stringify(target)).not.toContain("s3cretpw");
  });

  it("never puts the password, user or full URL in the label or the result", async () => {
    const target = await resolveTarget(
      ["neon", "--yes"],
      { ...neonEnv, NEON_BRANCH: "dev" },
      inspect,
    );
    if (!target.ok) throw new Error("expected a target");
    for (const shown of [target.label, target.host]) {
      expect(shown).not.toContain("s3cretpw");
      expect(shown).not.toContain("owner");
      expect(shown).not.toContain(NEON_URL);
    }
  });

  it("does not inspect the URL when --yes is missing", async () => {
    const spy = jest.fn(inspect);
    await resolveTarget(["neon"], neonEnv, spy);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("resolveTarget arguments", () => {
  it.each([
    [[]],
    [["prod"]],
    [["local", "neon"]],
    [["local", "extra"]],
    [["neon", "--yes", "--force"]],
    [["neon", "--yes", "--yes"]],
    [["--yes"]],
  ])("refuses %j with the usage text", async (argv) => {
    const target = await resolveTarget(argv, neonEnv, inspect);
    expect(target.ok).toBe(false);
    expect(!target.ok && target.error).toMatch(/Usage: pnpm db:apply/);
  });
});

describe("failureCode", () => {
  // drizzle wraps the postgres.js error: a DrizzleQueryError named "Error" with the driver error as its cause.
  it("reads the SQLSTATE from the cause, not the message", () => {
    const cause = Object.assign(
      new Error(`password authentication failed for user "owner"`),
      { name: "PostgresError", code: "28P01" },
    );
    const wrapped = new Error("Failed query: select ... params: s3cretpw", {
      cause,
    });
    expect(failureCode(wrapped)).toBe("28P01");
  });

  it("reads a system code from an unwrapped error", () => {
    expect(
      failureCode(Object.assign(new Error("x"), { code: "ECONNREFUSED" })),
    ).toBe("ECONNREFUSED");
  });

  it.each([
    ["no code", new Error("password s3cretpw")],
    ["a code that is not a plain code", { code: "bad s3cretpw code" }],
    ["a non-string code", { code: 42 }],
    ["null", null],
    ["a string", "s3cretpw"],
  ])("says unknown for %s and never echoes input", (_name, error) => {
    expect(failureCode(error)).toBe("unknown");
  });
});

describe("the grants", () => {
  let text = "";
  const fake = ((strings: TemplateStringsArray) => {
    text = strings.join("?");
    return Promise.resolve([]);
  }) as unknown as Sql;
  const bare = (statement: string) =>
    statement.replace(/\s+/g, " ").replace(/;$/, "").trim();

  it("run the same privilege grant verify-rls tells people to run", async () => {
    await grantPrivileges(fake);
    expect(bare(text)).toBe(bare(GRANT_PRIVILEGES));
  });

  // verify-rls prints the same grant with the user name filled in by format(%I, current_user).
  it("let the connected owner assume platemate_app", async () => {
    await grantMembership(fake);
    expect(bare(text)).toBe(
      "grant platemate_app to current_user with set true",
    );
  });
});

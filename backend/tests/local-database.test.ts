import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { isLocalConnection } from "../db/src/local-database";

// postgres is ESM-only and Jest here runs CommonJS, so a child process builds the client exactly as the scripts
// do (`postgres(url, { max: 1 })`, lazy: no connection, no network) and returns the options postgres.js resolved.
type Resolved = {
  host: string[];
  connection: Record<string, unknown>;
} | null;
const resolveWithPostgres = (urls: string[]) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import postgres from "postgres";
         const out = JSON.parse(process.argv[1]).map((url) => {
           try {
             const { host, connection } = postgres(url, { max: 1 }).options;
             return { host, connection };
           } catch { return null; }
         });
         console.log(JSON.stringify(out));`,
        JSON.stringify(urls),
      ],
      { cwd: join(__dirname, "../db"), encoding: "utf8", timeout: 20_000 },
    ),
  ) as Resolved[];
const isLocal = (url: string) => {
  const [resolved] = resolveWithPostgres([url]);
  return resolved !== null && isLocalConnection(resolved);
};

describe("the local-only guard, on the options postgres.js resolves", () => {
  it.each([
    "postgresql://platemate:platemate@localhost:5432/platemate",
    "postgresql://platemate:platemate@127.0.0.1:5432/platemate",
  ])("accepts %s", (url) => {
    expect(isLocal(url)).toBe(true);
  });

  it.each([
    "postgresql://u:p@ep-cool-123.eu-central-1.aws.neon.tech/db",
    "not a url",
    "postgresql://u:p@localhost.evil.com:5432/db",
    "postgresql://localhost:p@evil.com:5432/db",
    // postgres.js reads these differently from the WHATWG URL parser: it would connect to evil.example
    "postgresql://u:p@localhost/db?host=evil.example",
    "postgresql://u:p@localhost#@evil.example/db",
    "postgresql://u:p@localhost/db?hostaddr=203.0.113.7",
    "postgresql://u:p@localhost,evil.example/db",
  ])("refuses %s", (url) => {
    expect(isLocal(url)).toBe(false);
  });
});

describe("isLocalConnection", () => {
  it("refuses an empty host list", () => {
    expect(isLocalConnection({ host: [], connection: {} })).toBe(false);
  });
});

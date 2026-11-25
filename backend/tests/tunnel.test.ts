// scripts/tunnel.mjs is a root script, outside every Jest project, so its test lives here (the backend project
// only matches backend/tests). Safety: the child gets an empty temp folder as cwd (no .env.local) and as PATH,
// and a temp LOCALAPPDATA, so neither `ngrok` nor the winget fallback can resolve to a real binary and no real
// tunnel can start. The timeout is a backstop only.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const script = resolve(__dirname, "..", "..", "scripts", "tunnel.mjs");
let sandbox: string;

beforeAll(() => {
  sandbox = mkdtempSync(join(tmpdir(), "tunnel-test-"));
});
afterAll(() => {
  rmSync(sandbox, { recursive: true, force: true });
});

function run(domain: string | undefined) {
  const env: Record<string, string> = {
    PATH: sandbox,
    LOCALAPPDATA: sandbox,
  };
  // Windows needs these to start a process at all; neither contains ngrok.
  if (process.env.SystemRoot) env.SystemRoot = process.env.SystemRoot;
  if (domain !== undefined) env.NGROK_DOMAIN = domain;
  return spawnSync(process.execPath, [script], {
    cwd: sandbox,
    env,
    encoding: "utf8",
    timeout: 15_000,
    killSignal: "SIGKILL",
  });
}

const oneSkipLine = (stdout: string) => {
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  expect(lines).toHaveLength(1);
  expect(lines[0]).toMatch(/^\[tunnel\] .*skipping the ngrok tunnel\.$/);
  expect(lines[0]).not.toContain("starting ngrok");
  return lines[0];
};

describe("scripts/tunnel.mjs skip paths", () => {
  it("prints the not-set line and exits 0 when NGROK_DOMAIN is unset", () => {
    const result = run(undefined);

    expect(result.status).toBe(0);
    expect(oneSkipLine(result.stdout)).toContain("NGROK_DOMAIN is not set");
    expect(result.stderr).toBe("");
  });

  it("treats a blank NGROK_DOMAIN as not set", () => {
    const result = run("   ");

    expect(result.status).toBe(0);
    expect(oneSkipLine(result.stdout)).toContain("NGROK_DOMAIN is not set");
  });

  it.each([
    ["a url with scheme and path", "https://x/y"],
    ["a space", "a b.ngrok-free.dev"],
    ["a leading hyphen", "-x.ngrok-free.dev"],
    ["a trailing hyphen on a label", "x-.ngrok-free.dev"],
    ["an embedded newline", "a.ngrok-free.dev\nb.ngrok-free.dev"],
    ["a single label with no dot", "localhost"],
    ["a port", "a.ngrok-free.dev:443"],
    ["a command separator", "a.ngrok-free.dev&calc"],
    ["an empty label", "a..ngrok-free.dev"],
  ])("rejects %s with the bare-hostname line and exits 0", (_name, value) => {
    const result = run(value);

    expect(result.status).toBe(0);
    expect(oneSkipLine(result.stdout)).toContain("must be a bare hostname");
  });

  it("prints the not-found line and exits 0 for a valid domain when ngrok is nowhere", () => {
    const result = run("my-app.ngrok-free.dev");

    expect(result.status).toBe(0);
    expect(oneSkipLine(result.stdout)).toContain("ngrok was not found");
  });
});

// Opens the ngrok tunnel to the backend (port 8787) for the Clerk webhook while `pnpm dev` runs.
// Skips with one line, exit 0, when NGROK_DOMAIN is unset or invalid or ngrok is not installed,
// so dev never breaks for it.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const domain = process.env.NGROK_DOMAIN?.trim();
// The value reaches a command line: letters, digits, hyphens and dots only, no scheme or path.
const validHost =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

// shortcut: winget installs ngrok under WinGet\Links, and a terminal opened before the install does not have it on PATH, so look there too; add other install locations if someone installs it elsewhere.
const wingetNgrok = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Links", "ngrok.exe")
  : undefined;
const findNgrok = () =>
  ["ngrok", wingetNgrok].find(
    (command) =>
      command &&
      spawnSync(command, ["version"], { stdio: "ignore" }).status === 0,
  );
const ngrok = domain && validHost.test(domain) ? findNgrok() : undefined;

if (!domain) {
  console.log("[tunnel] NGROK_DOMAIN is not set; skipping the ngrok tunnel.");
} else if (!validHost.test(domain)) {
  console.log(
    "[tunnel] NGROK_DOMAIN must be a bare hostname (no https://, path or spaces); skipping the ngrok tunnel.",
  );
} else if (!ngrok) {
  console.log(
    "[tunnel] ngrok was not found on PATH or in the winget folder; skipping the ngrok tunnel.",
  );
} else {
  console.log(`[tunnel] starting ngrok: https://${domain} -> localhost:8787`);
  // --log=stdout prints plain log lines; ngrok's default full-screen display needs a terminal, which turbo does not give it.
  const tunnel = spawn(
    ngrok,
    ["http", `--url=${domain}`, "8787", "--log=stdout"],
    { stdio: "inherit" },
  );
  // Exit 0 even when ngrok fails: turbo stops every dev task when a persistent task exits non-zero.
  tunnel.on("exit", (code) => {
    console.log(
      `[tunnel] ngrok exited with code ${code}; the webhook tunnel is down.`,
    );
    process.exit(0);
  });
  tunnel.on("error", () => {
    console.log("[tunnel] could not start ngrok; the webhook tunnel is down.");
    process.exit(0);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => tunnel.kill());
  }
}

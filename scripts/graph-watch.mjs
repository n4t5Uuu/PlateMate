// Keeps the graphify code graph fresh while `pnpm dev` runs. Code only, no model calls.
// Skips quietly when graphify is not installed or no graph exists, so dev never breaks for it.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const installed =
  spawnSync("graphify", ["--help"], { stdio: "ignore" }).status === 0;
if (!installed) {
  console.log("[graph] graphify is not installed; skipping the graph watcher.");
} else if (!existsSync("graphify-out/graph.json")) {
  console.log(
    "[graph] no graph yet; run /graphify . once in Claude Code, then restart.",
  );
} else {
  const watcher = spawn("graphify", ["watch", "."], { stdio: "inherit" });
  watcher.on("exit", (code) => process.exit(code ?? 0));
}

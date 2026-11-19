// PreToolUse hook for the newcomer agent: the only shell command allowed is starting the app.
// Fails closed: anything unparseable or unlisted is blocked (exit 2 = block, stderr goes to the agent).
const ALLOWED = [/^pnpm\s+(run\s+)?dev$/];

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let command = "";
try {
  command = String(JSON.parse(raw)?.tool_input?.command ?? "").trim();
} catch {
  console.error("newcomer: could not read the tool call, blocked.");
  process.exit(2);
}

if (ALLOWED.some((re) => re.test(command))) process.exit(0);

console.error(
  "Blocked: the newcomer agent may not run shell commands, except `pnpm dev` to start the app. Use the browser and what is on screen.",
);
process.exit(2);

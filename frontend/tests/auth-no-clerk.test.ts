import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (
      name === "node_modules" ||
      name === ".next" ||
      name === "tests" ||
      name.startsWith(".")
    )
      return [];
    return statSync(p).isDirectory()
      ? sources(p)
      : /\.(tsx?|css|mjs)$/.test(name)
        ? [p]
        : [];
  });
}

// Clerk is deliberately not wired into the auth shell yet.
describe("frontend source", () => {
  it("does not import Clerk or mount a ClerkProvider", () => {
    const offenders = sources(root).filter((f) =>
      /(from|import|require\()\s*\(?["']@clerk|<ClerkProvider/.test(
        readFileSync(f, "utf8"),
      ),
    );
    expect(offenders).toEqual([]);
  });
});

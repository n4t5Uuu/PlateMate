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
      : /\.(tsx?|mjs)$/.test(name)
        ? [p]
        : [];
  });
}

// Research R9: ClerkProvider goes inside <body>, not around <html>, and is mounted once.
describe("ClerkProvider mounting", () => {
  const layout = readFileSync(join(root, "app", "layout.tsx"), "utf8");

  it("is imported from @clerk/nextjs in the root layout", () => {
    expect(layout).toMatch(
      /import\s*\{[^}]*\bClerkProvider\b[^}]*\}\s*from\s*["']@clerk\/nextjs["']/,
    );
  });

  it("sits inside <body>, not around <html>", () => {
    const open = layout.indexOf("<body");
    const provider = layout.indexOf("<ClerkProvider");
    const close = layout.indexOf("</body>");
    expect(open).toBeGreaterThan(-1);
    expect(provider).toBeGreaterThan(open);
    expect(close).toBeGreaterThan(provider);
  });

  it("is mounted exactly once in the frontend source", () => {
    const mounts = sources(root).flatMap((f) =>
      Array.from(readFileSync(f, "utf8").matchAll(/<ClerkProvider/g), () => f),
    );
    expect(mounts).toEqual([join(root, "app", "layout.tsx")]);
  });
});

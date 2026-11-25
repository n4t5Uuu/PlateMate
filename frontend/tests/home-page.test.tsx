import { readdirSync, readFileSync, statSync } from "node:fs";
import { Writable } from "node:stream";
import { join } from "node:path";
import type { ReactElement } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Home from "@/app/page";

// T026, FR-023. The fake user fills every field a name or email could come from.
jest.mock("@clerk/nextjs/server", () => ({ currentUser: jest.fn() }));
// UserButton throws outside a ClerkProvider; the stub keeps the sheet renderable.
jest.mock("@clerk/nextjs", () => ({ UserButton: () => null }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
}));

const currentUserMock = jest.mocked(currentUser);
const redirectMock = jest.mocked(redirect);

const payload = "<img src=x onerror=alert(1)>";

function fakeUser(over: Record<string, unknown> = {}) {
  return {
    id: "user_test",
    firstName: payload,
    lastName: "Tester",
    fullName: `${payload} Tester`,
    username: null,
    primaryEmailAddress: { emailAddress: "ada@example.com" },
    emailAddresses: [{ emailAddress: "ada@example.com" }],
    ...over,
  } as unknown as Awaited<ReturnType<typeof currentUser>>;
}

// Renders like a crawler would: waits for every Suspense boundary, then returns the finished HTML.
// Works for async server components (the home page awaits currentUser()).
function renderToHtml(element: ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += String(chunk);
        done();
      },
    });
    sink.on("finish", () => resolve(html));
    const stream = renderToPipeableStream(element, {
      onAllReady: () => stream.pipe(sink),
      onShellError: reject,
      onError: reject,
    });
  });
}

describe("signed-in home page (T026)", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    redirectMock.mockClear();
  });

  it("shows the person's name and email as plain text", async () => {
    currentUserMock.mockResolvedValue(
      fakeUser({
        firstName: "Ada",
        lastName: "Lovelace",
        fullName: "Ada Lovelace",
      }),
    );
    const html = await renderToHtml(<Home />);
    expect(html).toContain("Ada");
    expect(html).toContain("ada@example.com");
  });

  it("shows Not set when the person has no name or email", async () => {
    currentUserMock.mockResolvedValue(
      fakeUser({
        firstName: null,
        lastName: null,
        primaryEmailAddress: null,
      }),
    );
    const html = await renderToHtml(<Home />);
    expect(html.match(/Not set/g)).toHaveLength(2);
  });

  it("renders a script-like name as literal text, never as markup (FR-023)", async () => {
    currentUserMock.mockResolvedValue(fakeUser());
    const html = await renderToHtml(<Home />);
    // shown to the person, escaped
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    // and not parsed: no img element from the name, no attribute-carrying tag
    expect(html).not.toContain("<img src=x");
    expect(html).not.toMatch(/<[a-z][^>]*\sonerror\s*=/i);
    expect(html).not.toMatch(/<script[^>]*>[^<]*alert\(1\)/i);
  });

  it("escapes a name that tries to close its element and open a script", async () => {
    const evil = `"><script>alert(1)</script>`;
    currentUserMock.mockResolvedValue(
      fakeUser({ firstName: evil, fullName: `${evil} Tester` }),
    );
    const html = await renderToHtml(<Home />);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  // Interim guard in page.tsx until the proxy (T037) redirects instead.
  it("sends a signed-out visitor to /sign-in", async () => {
    currentUserMock.mockResolvedValue(null);
    await expect(renderToHtml(<Home />)).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});

// FR-023 / quickstart Scenario 9 step 4: nothing in the frontend may inject raw HTML.
describe("no raw HTML injection in the frontend source", () => {
  const root = join(import.meta.dirname, "..");
  const sources = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
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
        : /\.(tsx?|jsx?|mjs)$/.test(name)
          ? [p]
          : [];
    });

  it("has no dangerouslySetInnerHTML", () => {
    const offenders = sources(root).filter((f) =>
      readFileSync(f, "utf8").includes("dangerouslySetInnerHTML"),
    );
    expect(offenders).toEqual([]);
  });
});

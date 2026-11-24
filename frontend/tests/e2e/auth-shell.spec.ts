import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// e2e must not need the internet: abort every request that leaves localhost (Clerk's
// clerk.accounts.dev / clerk.com / protect.clerk.com init traffic included).
const blockExternal = (context: BrowserContext) =>
  context.route(
    (url) =>
      /^https?:$/.test(url.protocol) &&
      !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) => route.abort(),
  );

// Covers the default context of every test; a context made with `browser.newContext()` must call blockExternal itself.
test.beforeEach(({ context }) => blockExternal(context));

const routes = [
  {
    path: "/sign-in",
    title: "Sign in · PlateMate",
    sheet: "Sheet A-001 · Sign in",
    current: "Sign in",
  },
  {
    path: "/sign-in/foo",
    title: "Sign in · PlateMate",
    sheet: "Sheet A-001 · Sign in",
    current: "Sign in",
  },
  {
    path: "/sign-up",
    title: "Create account · PlateMate",
    sheet: "Sheet A-002 · Create account",
    current: "Create account",
  },
  {
    path: "/sign-up/foo",
    title: "Create account · PlateMate",
    sheet: "Sheet A-002 · Create account",
    current: "Create account",
  },
];

const tab = (page: Page, name: string) =>
  page.locator("nav a:visible", { hasText: new RegExp(`^${name}$`) });

const headings: Record<string, string> = {
  "/sign-in": "Sign in",
  "/sign-up": "Create account",
};

// Navigates and waits on the app itself: the h1 is shown and React has hydrated the form (no network-idle guess).
async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("h1:visible")).toHaveText(headings[path]);
  const email = page.locator("input[type=email]:visible");
  await expect(email).toBeVisible();
  await expect
    .poll(() =>
      email.evaluate((e) =>
        Object.keys(e).some((k) => k.startsWith("__reactFiber$")),
      ),
    )
    .toBe(true);
}

async function expectSettled(page: Page, heading: string) {
  await expect(page.locator(".auth-pane-exit")).toHaveCount(0);
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.locator("h1:visible")).toHaveText(heading);
  // every CSS transition and animation (blue plane, pane fades) has finished
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState === "finished" || a.playState === "idle"),
  );
  const dup = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    return ids.filter((x, i) => ids.indexOf(x) !== i);
  });
  expect(dup).toEqual([]);
  // label click focuses the visible pane's own input
  for (const [label, type] of [
    ["Email", "email"],
    ["Password", "password"],
  ] as const) {
    await page.locator("label:visible", { hasText: label }).click();
    const focused = await page.evaluate(() => {
      const e = document.activeElement as HTMLInputElement;
      const r = e.getBoundingClientRect();
      return { type: e.type, visible: r.width > 0 && r.height > 0 };
    });
    expect(focused).toEqual({ type, visible: true });
  }
}

const bluePose = (page: Page) =>
  page.evaluate(
    () =>
      getComputedStyle(document.querySelector(".auth-plane-blue")!).transform,
  );

// Largest horizontal overflow seen on every frame until the switch to `heading` has fully settled.
const maxOverflowWhileSwitching = (page: Page, heading: string) =>
  page.evaluate(
    (heading) =>
      new Promise<number>((resolve) => {
        let max = -Infinity;
        const tick = () => {
          max = Math.max(
            max,
            document.documentElement.scrollWidth - window.innerWidth,
          );
          const shown = [...document.querySelectorAll("h1")].some(
            (h) => h.textContent === heading && h.getClientRects().length > 0,
          );
          const idle = document
            .getAnimations()
            .every((a) => a.playState === "finished" || a.playState === "idle");
          if (shown && !document.querySelector(".auth-pane-exit") && idle)
            resolve(max);
          else requestAnimationFrame(tick);
        };
        tick();
      }),
    heading,
  );

type Shadow = { color: string; spread: number };
// Parses computed box-shadow layers such as "rgb(43, 63, 140) 0px 0px 0px 5px, rgba(0, 0, 0, 0) 0px 0px 0px 0px".
const shadowLayers = (boxShadow: string): Shadow[] =>
  [
    ...boxShadow.matchAll(
      /(rgba?\([^)]*\))\s+-?[\d.]+px\s+-?[\d.]+px\s+[\d.]+px\s+(-?[\d.]+)px/g,
    ),
  ].map((m) => ({
    color: m[1],
    spread: Number(m[2]),
  }));

test.describe("server HTML without JS", () => {
  for (const r of routes) {
    test(`${r.path} is rendered on the server`, async ({ request }) => {
      const html = await (await request.get(r.path)).text();
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(html.match(/<form[\s>]/g)).toHaveLength(1);
      expect(html).toContain(`<title>${r.title}</title>`);
      expect(html).toContain(r.sheet);
      expect(html).not.toContain("$RX");
      const current =
        html.match(/<a[^>]*aria-current="page"[^>]*>([^<]*)</g) ?? [];
      expect(current).toHaveLength(1);
      expect(current[0]).toContain(`>${r.current}<`);
    });
  }
});

test.describe("switching", () => {
  test("tab, back, forward and rapid toggling settle cleanly", async ({
    page,
  }) => {
    await open(page, "/sign-in");
    await expectSettled(page, "Sign in");
    const signInPose = await bluePose(page);

    await tab(page, "Create account").click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expectSettled(page, "Create account");
    const signUpPose = await bluePose(page);
    expect(signUpPose).not.toBe(signInPose);

    await page.goBack();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expectSettled(page, "Sign in");
    expect(await bluePose(page)).toBe(signInPose);

    await page.goForward();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expectSettled(page, "Create account");
    expect(await bluePose(page)).toBe(signUpPose);

    for (let i = 0; i < 4; i++) {
      await tab(page, "Sign in").click();
      await page.waitForTimeout(80); // deliberate pacing: clicks land while the previous switch is still animating
      await tab(page, "Create account").click();
      await page.waitForTimeout(80);
    }
    await tab(page, "Sign in").click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expectSettled(page, "Sign in");
    expect(await bluePose(page)).toBe(signInPose);
  });

  test("mid-transition the leaving pane is inert and fading", async ({
    page,
  }) => {
    await open(page, "/sign-in");
    await tab(page, "Create account").click();
    // wait until the old pane is really fading, not for a fixed time
    await page.waitForFunction(() => {
      const p = document.querySelector(".auth-pane-exit");
      return !!p && Number(getComputedStyle(p).opacity) < 1;
    });
    const leaving = await page.evaluate(() =>
      [...document.querySelectorAll(".auth-pane-exit")]
        .filter((p) => p.getClientRects().length > 0)
        .map((p) => ({
          inert: p.hasAttribute("inert"),
          opacity: Number(getComputedStyle(p).opacity),
          heading: p.querySelector("h1")?.textContent,
          animating: p.getAnimations().length > 0,
        })),
    );
    expect(leaving).toHaveLength(1);
    expect(leaving[0].inert).toBe(true);
    expect(leaving[0].heading).toBe("Sign in");
    expect(leaving[0].animating).toBe(true);
    expect(leaving[0].opacity).toBeLessThan(1);
    expect(leaving[0].opacity).toBeGreaterThan(0);
    // exactly one h1 is exposed (not inert, not hidden) while the old pane fades
    await expect(page.locator("h1:visible:not([inert] h1)")).toHaveCount(1);
  });

  test("a hard load of /sign-up starts in the sign-up pose", async ({
    page,
    browser,
  }) => {
    await open(page, "/sign-in");
    await tab(page, "Create account").click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expectSettled(page, "Create account");
    const switched = await bluePose(page);
    const context = await browser.newContext();
    await blockExternal(context);
    const fresh = await context.newPage();
    await open(fresh, "/sign-up");
    expect(await bluePose(fresh)).toBe(switched);
    expect(
      await fresh.evaluate(
        () => document.querySelectorAll(".auth-pane-exit").length,
      ),
    ).toBe(0);
    await context.close();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("switch is instant: no leaving pane, no transition", async ({
    page,
  }) => {
    await open(page, "/sign-in");
    const before = await bluePose(page);
    // record whether a leaving pane ever appears, even for a single frame
    await page.evaluate(() => {
      const w = window as unknown as { sawExit: boolean };
      w.sawExit = false;
      new MutationObserver(() => {
        if (document.querySelector(".auth-pane-exit")) w.sawExit = true;
      }).observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
      });
    });
    await tab(page, "Create account").click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expect(page.locator("h1:visible")).toHaveText("Create account");
    await expect(page.locator(".auth-pane-exit")).toHaveCount(0);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => (window as unknown as { sawExit: boolean }).sawExit,
      ),
    ).toBe(false);
    const info = await page.evaluate(() => ({
      pose: getComputedStyle(document.querySelector(".auth-plane-blue")!)
        .transform,
      transition: getComputedStyle(document.querySelector(".auth-plane-blue")!)
        .transitionDuration,
      enter: [...document.querySelectorAll(".auth-pane-enter")].map(
        (p) => getComputedStyle(p).animationName,
      ),
    }));
    expect(info.pose).not.toBe(before);
    expect(info.transition).toBe("0s");
    expect(info.enter.every((n) => n === "none")).toBe(true);
    await expectSettled(page, "Create account");
  });
});

test.describe("375px", () => {
  test.use({ viewport: { width: 375, height: 700 } });
  test("no horizontal scroll on either route, before and after switching", async ({
    page,
  }) => {
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
    for (const [start, other] of [
      ["/sign-in", "Create account"],
      ["/sign-up", "Sign in"],
    ]) {
      await open(page, start);
      expect(await overflow()).toBeLessThanOrEqual(0);
      await tab(page, other).click();
      expect(await maxOverflowWhileSwitching(page, other)).toBeLessThanOrEqual(
        0,
      );
      expect(await overflow()).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("keyboard and placeholders", () => {
  test("tab order and a visible focus indicator on every control", async ({
    page,
  }) => {
    await open(page, "/sign-in");
    const expected = [
      "Sign in",
      "Create account",
      "Continue with Google",
      "Continue with Microsoft",
      "Email",
      "Password",
      "Sign in",
      "Forgot your password?",
    ];
    const seen: string[] = [];
    for (let i = 0; i < expected.length; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(async () => {
        // buttons use transition-all, so the ring fades in; read the style once it has finished
        await Promise.all(
          document
            .getAnimations()
            .map((a) => a.finished.catch(() => undefined)),
        );
        const e = document.activeElement as HTMLElement;
        const cs = getComputedStyle(e);
        // a transparent outline or ring is not a visible indicator
        const alpha = (c: string) =>
          Number(
            c.match(/\/\s*([\d.]+)\s*\)/)?.[1] ??
              c.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)?.[1] ??
              1,
          );
        const outline =
          cs.outlineStyle !== "none" &&
          parseFloat(cs.outlineWidth) > 0 &&
          alpha(cs.outlineColor) > 0;
        const ring = [
          ...cs.boxShadow.matchAll(
            /(rgba?\([^)]*\))\s+-?[\d.]+px\s+-?[\d.]+px\s+[\d.]+px\s+(-?[\d.]+)px/g,
          ),
        ].some((m) => Number(m[2]) > 0 && alpha(m[1]) > 0);
        const name =
          e instanceof HTMLInputElement
            ? e.type === "email"
              ? "Email"
              : "Password"
            : (e.textContent ?? "").trim();
        return {
          name,
          focusVisible: e.matches(":focus-visible"),
          indicator: outline || ring,
        };
      });
      seen.push(info.name);
      expect
        .soft(info.focusVisible, `${info.name} matches :focus-visible`)
        .toBe(true);
      expect
        .soft(
          info.indicator,
          `${info.name} (tab stop ${i + 1}) has a visible focus indicator`,
        )
        .toBe(true);
    }
    expect(seen).toEqual(expected);
  });

  for (const path of ["/sign-in", "/sign-up"]) {
    test(`${path}: both tab links show a 3px blue ring when focused, active or not`, async ({
      page,
    }) => {
      await open(page, path);
      const stops: { name: string; current: boolean; layers: Shadow[] }[] = [];
      for (let i = 0; i < 2; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(async () => {
          await Promise.all(
            document
              .getAnimations()
              .map((a) => a.finished.catch(() => undefined)),
          );
          const e = document.activeElement as HTMLElement;
          return {
            name: (e.textContent ?? "").trim(),
            current: e.getAttribute("aria-current") === "page",
            focusVisible: e.matches(":focus-visible"),
            boxShadow: getComputedStyle(e).boxShadow,
          };
        });
        expect(info.focusVisible).toBe(true);
        stops.push({
          name: info.name,
          current: info.current,
          layers: shadowLayers(info.boxShadow),
        });
      }
      expect(stops.map((s) => s.name)).toEqual(["Sign in", "Create account"]);
      expect(stops.filter((s) => s.current)).toHaveLength(1); // one active, one inactive
      for (const stop of stops) {
        // --ring is #2b3f8c; a 2px page-background offset layer sits under it, so a 3px ring has spread 5px
        const ring = stop.layers.find((l) => l.color === "rgb(43, 63, 140)");
        const gap = stop.layers.find((l) => l.color === "rgb(250, 250, 248)");
        expect(
          ring,
          `${stop.name} (${stop.current ? "active" : "inactive"}) has a blue ring layer`,
        ).toBeDefined();
        expect(gap, `${stop.name} has the offset layer`).toBeDefined();
        expect(gap!.spread, `${stop.name} ring offset`).toBe(2);
        expect(ring!.spread - gap!.spread, `${stop.name} ring width`).toBe(3);
      }
    });
  }

  test("placeholders do nothing and Enter does not submit", async ({
    page,
  }) => {
    await open(page, "/sign-in");
    await page.evaluate(
      () => ((window as unknown as { marker: number }).marker = 1),
    );
    const navs: string[] = [];
    page.on("framenavigated", (f) => navs.push(f.url()));
    // Only the app's own origin counts: Clerk's init traffic goes to other hosts and is aborted by
    // blockExternal, so a request here means a placeholder or Enter really submitted something.
    const appOrigin = new URL(page.url()).origin;
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET" && new URL(r.url()).origin === appOrigin)
        requests.push(r.url());
    });

    for (const name of [
      "Continue with Google",
      "Continue with Microsoft",
      "Sign in",
      "Forgot your password?",
    ]) {
      const btn = page.locator("section button", {
        hasText: new RegExp(`^${name.replace("?", "\\?")}$`),
      });
      await expect(btn).toHaveAttribute("aria-disabled", "true");
      await btn.click({ force: true }); // Playwright treats aria-disabled as not enabled
      await btn.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
    }
    await page.locator("input[type=email]").fill("a@b.co");
    await page.keyboard.press("Enter");
    await page.locator("input[type=password]").fill("secret123");
    await page.keyboard.press("Enter");
    // two frames: a submit or navigation started by the key presses would have begun by now
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );

    expect(page.url()).toMatch(/\/sign-in$/);
    expect(navs).toEqual([]);
    expect(requests).toEqual([]);
    expect(
      await page.evaluate(
        () => (window as unknown as { marker?: number }).marker,
      ),
    ).toBe(1);
    await expect(page.locator("input[type=email]")).toHaveValue("a@b.co");
  });
});

test("the home page still renders", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("body")).not.toBeEmpty();
});

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Spec pass for T025/T026/T027 (specs/001-user-auth), written before the Clerk sign-up page and the
// signed-in home exist. Clerk's <SignUp /> loads its script from Clerk's servers, which these tests
// block, so nothing here looks inside it: only the shell around it (tabs, heading, sheet, animation)
// and the signed-out routing. Locators marked "provisional" depend on markup not yet written.

const blockExternal = (context: BrowserContext) =>
  context.route(
    (url) =>
      /^https?:$/.test(url.protocol) &&
      !["localhost", "127.0.0.1"].includes(url.hostname),
    (route) => route.abort(),
  );

test.beforeEach(({ context }) => blockExternal(context));

const tab = (page: Page, name: string) =>
  page.locator("nav a:visible", { hasText: new RegExp(`^${name}$`) });

// Waits on the app, never on networkidle (Clerk's init traffic keeps the page busy). The tab link
// being hydrated means a click is a client-side switch, so the animation runs.
async function open(page: Page, path: string, heading: string) {
  await page.goto(path);
  await expect(page.locator("h1:visible")).toHaveText(heading); // provisional: h1 kept in the sheet
  const link = tab(page, "Sign in");
  await expect(link).toBeVisible();
  await expect
    .poll(() =>
      link.evaluate((e) =>
        Object.keys(e).some((k) => k.startsWith("__reactFiber$")),
      ),
    )
    .toBe(true);
}

// Like auth-shell's expectSettled, minus the Email/Password label clicks (the sign-up form is Clerk's now).
async function expectSettled(page: Page, heading: string) {
  await expect(page.locator(".auth-pane-exit")).toHaveCount(0);
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.locator("h1:visible")).toHaveText(heading);
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
}

const bluePose = (page: Page) =>
  page.evaluate(
    () =>
      getComputedStyle(document.querySelector(".auth-plane-blue")!).transform,
  );

test.describe("sign-up page", () => {
  for (const path of ["/sign-up", "/sign-up/foo"]) {
    test(`${path} answers 200 with Create account marked current`, async ({
      page,
      request,
    }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toContain("<title>Create account · PlateMate</title>");
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      const current =
        html.match(/<a[^>]*aria-current="page"[^>]*>([^<]*)</g) ?? [];
      expect(current).toHaveLength(1);
      expect(current[0]).toContain(">Create account<");

      await open(page, path, "Create account");
      await expect(tab(page, "Create account")).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect(tab(page, "Sign in")).not.toHaveAttribute("aria-current");
    });
  }

  test("the sign-up section is labelled by its h1", async ({ page }) => {
    await open(page, "/sign-up", "Create account");
    const labelled = await page.evaluate(() => {
      const h1 = document.querySelector(
        "h1:not([inert] h1):not([aria-hidden] h1)",
      );
      const section = h1?.closest("section");
      const id = section?.getAttribute("aria-labelledby");
      return {
        sectionHasLabel: !!id,
        target: id ? document.getElementById(id)?.tagName : null,
        sameElement: !!id && document.getElementById(id) === h1,
      };
    });
    expect(labelled).toEqual({
      sectionHasLabel: true,
      target: "H1",
      sameElement: true,
    });
  });

  // Clerk's script comes from Clerk's servers, which this suite blocks, so this only runs where
  // Clerk can load. Offline it skips; check it by hand against the real CDN (never submit the form).
  test("Clerk's inputs are 44px tall when Clerk loads", async ({ page }) => {
    await page.goto("/sign-up");
    const input = page.locator(".cl-formFieldInput").first();
    const loaded = await input
      .waitFor({ state: "visible", timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!loaded, "Clerk cannot load: external requests are blocked");
    const height = await input.evaluate((e) => getComputedStyle(e).height);
    expect(height).toBe("44px");
  });

  test("a signed-out visitor stays on /sign-up (no redirect to /sign-in or /)", async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on("framenavigated", (f) => {
      if (f === page.mainFrame()) urls.push(new URL(f.url()).pathname);
    });
    await open(page, "/sign-up", "Create account");
    expect(new URL(page.url()).pathname).toBe("/sign-up");
    expect(urls.every((p) => p === "/sign-up")).toBe(true);
  });

  test("switching to Sign in and back keeps the animated transition working", async ({
    page,
  }) => {
    await open(page, "/sign-up", "Create account");
    await expectSettled(page, "Create account");
    const signUpPose = await bluePose(page);

    await tab(page, "Sign in").click();
    // the leaving pane really fades and is inert, as on the sign-in to sign-up switch
    await page.waitForFunction(() => {
      const p = document.querySelector(".auth-pane-exit");
      return !!p && Number(getComputedStyle(p).opacity) < 1;
    });
    const leaving = await page.evaluate(() =>
      [...document.querySelectorAll(".auth-pane-exit")]
        .filter((p) => p.getClientRects().length > 0)
        .map((p) => ({
          inert: p.hasAttribute("inert"),
          animating: p.getAnimations().length > 0,
          opacity: Number(getComputedStyle(p).opacity),
        })),
    );
    expect(leaving).toHaveLength(1);
    expect(leaving[0].inert).toBe(true);
    expect(leaving[0].animating).toBe(true);
    expect(leaving[0].opacity).toBeLessThan(1);

    await expect(page).toHaveURL(/\/sign-in$/);
    await expectSettled(page, "Sign in");
    const signInPose = await bluePose(page);
    expect(signInPose).not.toBe(signUpPose);
    // the sign-in page is unchanged: its placeholder form is still there and hydrated
    await expect(page.locator("input[type=email]:visible")).toBeVisible();

    await tab(page, "Create account").click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expectSettled(page, "Create account");
    expect(await bluePose(page)).toBe(signUpPose);
  });

  test("back and forward between the two pages settle on one visible h1", async ({
    page,
  }) => {
    await open(page, "/sign-up", "Create account");
    await tab(page, "Sign in").click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expectSettled(page, "Sign in");
    await page.goBack();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expectSettled(page, "Create account");
    await page.goForward();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expectSettled(page, "Sign in");
  });
});

test.describe("signed-out home (T026)", () => {
  // Interim (page.tsx shortcut): the page streams a "Loading…" shell, then redirects from the client
  // and a meta refresh; T037's proxy turns this into a real 30x. Update this test then.
  test("GET / answers 200 with a refresh to /sign-in, and /sign-in answers by itself", async ({
    request,
  }) => {
    const res = await request.get("/", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(
      /<meta[^>]*http-equiv="refresh"[^>]*content="1;url=\/sign-in"/,
    );
    expect(html).not.toContain("@example.com");
    // the target answers by itself: no bounce back to /
    const target = await request.get("/sign-in", { maxRedirects: 0 });
    expect(target.status()).toBe(200);
  });

  test("opening / ends on /sign-in without a redirect loop", async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on("framenavigated", (f) => {
      if (f === page.mainFrame()) urls.push(new URL(f.url()).pathname);
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in(\?.*)?$/);
    await expect(page.locator("h1:visible")).toHaveText("Sign in");
    // let any late client-side redirect happen, then check it stayed put
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    expect(new URL(page.url()).pathname).toBe("/sign-in");
    // Each page reports its navigation twice (a same-document update follows the load), and on a
    // Clerk dev instance `/` also passes through a handshake. Collapsing repeats leaves the hops:
    // one step from / to /sign-in. A loop would add more.
    const hops = urls.filter((p, i) => p !== urls[i - 1]);
    expect(hops).toEqual(["/", "/sign-in"]);
  });

  test("the signed-out home shows no account details", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1:visible")).toHaveText("Sign in");
    await expect(page.locator("body")).not.toContainText("@example.com");
  });
});

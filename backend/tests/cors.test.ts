import { Hono } from "hono";
import { appCors } from "../src/cors";

const appUrl = "http://localhost:3000";

const app = new Hono()
  .use(appCors(appUrl))
  .get("/ping", (c) => c.json({ ok: true }));

describe("appCors", () => {
  it("answers the app origin with that origin", async () => {
    const res = await app.request("/ping", { headers: { Origin: appUrl } });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(appUrl);
  });

  it("sends no CORS headers to another origin", async () => {
    const res = await app.request("/ping", {
      headers: { Origin: "https://evil.example" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("sends no CORS headers to another origin on a preflight", async () => {
    const res = await app.request("/ping", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.example",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization",
      },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(res.headers.get("Access-Control-Allow-Headers")).toBeNull();
  });

  it("allows the Authorization and Content-Type headers in a preflight", async () => {
    const res = await app.request("/ping", {
      method: "OPTIONS",
      headers: {
        Origin: appUrl,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
    const allowed = (res.headers.get("Access-Control-Allow-Headers") ?? "")
      .toLowerCase()
      .split(/\s*,\s*/);
    expect(allowed).toEqual(
      expect.arrayContaining(["authorization", "content-type"]),
    );
  });

  it("never allows credentials", async () => {
    const res = await app.request("/ping", { headers: { Origin: appUrl } });
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBeNull();
  });

  it("never allows credentials on a preflight either", async () => {
    const res = await app.request("/ping", {
      method: "OPTIONS",
      headers: {
        Origin: appUrl,
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(appUrl);
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBeNull();
  });

  it("lets a request with no Origin through, with no CORS headers", async () => {
    const res = await app.request("/ping");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(res.headers.get("Access-Control-Allow-Headers")).toBeNull();
  });

  it("lets a preflight with no Origin reach the app, with no CORS headers", async () => {
    const res = await app.request("/ping", { method: "OPTIONS" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(res.headers.get("Access-Control-Allow-Headers")).toBeNull();
  });

  it.each([
    ["a different port", "http://localhost:3001"],
    ["a different scheme", "https://localhost:3000"],
    ["a lookalike suffix", "http://localhost:3000.evil.example"],
    ["a lookalike prefix", "http://evil.localhost:3000"],
    ["the null origin", "null"],
    ["a different case", "HTTP://LOCALHOST:3000"],
  ])("sends no CORS headers to %s, even on a preflight", async (_n, origin) => {
    for (const method of ["GET", "OPTIONS"]) {
      const res = await app.request("/ping", {
        method,
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "authorization",
        },
      });
      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
      expect(res.headers.get("Access-Control-Allow-Headers")).toBeNull();
      expect(res.headers.get("Access-Control-Allow-Credentials")).toBeNull();
    }
  });

  it("treats a trailing slash or path in APP_URL as its origin", async () => {
    const withPath = new Hono()
      .use(appCors("http://localhost:3000/some/path/"))
      .get("/ping", (c) => c.json({ ok: true }));
    const res = await withPath.request("/ping", {
      headers: { Origin: appUrl },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(appUrl);
  });

  it("fails clearly when APP_URL is missing or not an http(s) URL", () => {
    expect(() => appCors(undefined)).toThrow(/APP_URL is missing/);
    expect(() => appCors("")).toThrow(/APP_URL is missing/);
    expect(() => appCors("not a url")).toThrow(
      /APP_URL is not a valid http\(s\) URL/,
    );
    expect(() => appCors("ftp://example.com")).toThrow(
      /APP_URL is not a valid http\(s\) URL/,
    );
  });

  it.each(["   ", "\t\n", "javascript:alert(1)"])(
    "fails at startup for %p without echoing it",
    (bad) => {
      let message = "";
      try {
        appCors(bad);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toMatch(/APP_URL/);
      expect(message.trim().length).toBeGreaterThan(0);
      if (bad.trim()) expect(message).not.toContain(bad);
    },
  );

  it("treats a whitespace-only APP_URL as missing", () => {
    expect(() => appCors("   ")).toThrow(/APP_URL is missing/);
  });

  it("does not echo the value in the error", () => {
    let message = "";
    try {
      appCors("secret-looking-value");
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/APP_URL/);
    expect(message).not.toContain("secret-looking-value");
  });
});

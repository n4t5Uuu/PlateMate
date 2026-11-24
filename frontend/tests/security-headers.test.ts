import { securityHeaders } from "@/lib/security-headers";

const fapi = "clerk.example.accounts.dev";
// A Clerk publishable key is "pk_test_" plus the base64 of "<frontend API host>$".
const publishableKey = `pk_test_${Buffer.from(`${fapi}$`).toString("base64")}`;

// The origins Clerk's content-security-policy guide lists for script-src.
const allowedScriptSources = [
  "'self'",
  `https://${fapi}`,
  "https://challenges.cloudflare.com",
  "https://*.protect.clerk.com",
];

function headerValue(key: string, headers = securityHeaders(publishableKey)) {
  return headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
}

function directive(name: string, headers = securityHeaders(publishableKey)) {
  const csp = headerValue("Content-Security-Policy-Report-Only", headers) ?? "";
  const found = csp
    .split(";")
    .map((d) => d.trim().split(/\s+/))
    .find(([n]) => n === name);
  return found?.slice(1);
}

describe("securityHeaders", () => {
  it("sends the policy as report-only for now", () => {
    expect(headerValue("Content-Security-Policy-Report-Only")).toBeDefined();
    expect(headerValue("Content-Security-Policy")).toBeUndefined();
  });

  it("never allows unsafe-eval", () => {
    expect(headerValue("Content-Security-Policy-Report-Only")).not.toContain(
      "unsafe-eval",
    );
  });

  it("locks down plugins, base URI and framing", () => {
    expect(directive("object-src")).toEqual(["'none'"]);
    expect(directive("base-uri")).toEqual(["'self'"]);
    expect(directive("frame-ancestors")).toEqual(["'none'"]);
  });

  it("allows only self and Clerk's origins as script sources", () => {
    expect(directive("script-src")?.toSorted()).toEqual(
      allowedScriptSources.toSorted(),
    );
  });

  it("drops the Frontend API origin when the key is missing or malformed", () => {
    for (const key of [undefined, "", "not-a-key"]) {
      const scripts = directive("script-src", securityHeaders(key));
      expect(scripts).toContain("'self'");
      expect(scripts).not.toContain(`https://${fapi}`);
      expect(scripts?.some((s) => s.includes("undefined"))).toBe(false);
    }
  });

  it("pins connect-src, img-src and frame-src to Clerk's origins", () => {
    expect(directive("connect-src")?.toSorted()).toEqual(
      ["'self'", `https://${fapi}`, "https://*.protect.clerk.com:*"].toSorted(),
    );
    expect(directive("img-src")?.toSorted()).toEqual(
      ["'self'", "https://img.clerk.com"].toSorted(),
    );
    expect(directive("frame-src")?.toSorted()).toEqual(
      [
        "https://challenges.cloudflare.com",
        "https://*.protect.clerk.com",
      ].toSorted(),
    );
  });

  it("drops the Frontend API origin when the decoded host is not a valid host", () => {
    for (const host of ["evil.com;script-src *", "a b.com", "x.com/é"]) {
      const key = `pk_live_${Buffer.from(`${host}$`).toString("base64")}`;
      const csp = headerValue(
        "Content-Security-Policy-Report-Only",
        securityHeaders(key),
      );
      expect(csp).not.toContain("evil.com");
      expect(csp).not.toContain("undefined");
      expect(directive("script-src", securityHeaders(key))).toEqual([
        "'self'",
        "https://challenges.cloudflare.com",
        "https://*.protect.clerk.com",
      ]);
      expect(directive("connect-src", securityHeaders(key))).toEqual([
        "'self'",
        "https://*.protect.clerk.com:*",
      ]);
    }
  });

  it("does not throw on a key whose payload is not valid base64", () => {
    expect(() => securityHeaders("pk_test_%%%not-base64%%%")).not.toThrow();
  });

  it("adds nosniff and a referrer policy", () => {
    expect(headerValue("X-Content-Type-Options")).toBe("nosniff");
    expect(headerValue("Referrer-Policy")).toBeTruthy();
  });
});

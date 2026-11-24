// Origins come from Clerk's content-security-policy guide (clerk.com/docs/guides/secure/best-practices/csp-headers).
const clerkProtect = "https://*.protect.clerk.com";
const cloudflareChallenge = "https://challenges.cloudflare.com";

// A publishable key is "pk_test_" or "pk_live_" plus the base64 of "<Frontend API host>$".
function frontendApiOrigin(publishableKey: string | undefined) {
  const encoded = publishableKey?.match(/^pk_(?:test|live)_(.+)$/)?.[1];
  if (!encoded) return undefined;
  try {
    const host = atob(encoded).replace(/\$$/, "");
    return /^[a-z0-9.-]+$/i.test(host) ? `https://${host}` : undefined;
  } catch {
    return undefined;
  }
}

export type SecurityHeader = { key: string; value: string };

/**
 * The security header set for every page. The policy is report-only until the
 * sign-in pages run clean under it (T062 switches it to enforced).
 *
 * shortcut: a static policy cannot allow Next's inline bootstrap scripts or
 * Clerk's inline scripts without 'unsafe-inline' (research R13), so this strict
 * policy reports them; enforcing it needs the nonce policy in proxy.ts.
 */
export function securityHeaders(
  publishableKey: string | undefined,
): SecurityHeader[] {
  const fapi = frontendApiOrigin(publishableKey) ?? "";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", fapi, cloudflareChallenge, clerkProtect],
    // The trailing ":*" is required: a source with no port matches port 443 only.
    "connect-src": ["'self'", fapi, `${clerkProtect}:*`],
    "img-src": ["'self'", "https://img.clerk.com"],
    "frame-src": [cloudflareChallenge, clerkProtect],
    // Clerk injects CSS at run time.
    "style-src": ["'self'", "'unsafe-inline'"],
    "worker-src": ["'self'", "blob:"],
    "font-src": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const csp = Object.entries(directives)
    .map(([name, sources]) => [name, ...sources.filter(Boolean)].join(" "))
    .join("; ");

  return [
    { key: "Content-Security-Policy-Report-Only", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ];
}

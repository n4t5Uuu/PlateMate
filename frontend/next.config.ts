import { existsSync } from "node:fs";
import type { NextConfig } from "next";

// Next only reads env files from this folder; also load the repo root one (cwd is frontend).
if (existsSync("../.env.local")) process.loadEnvFile("../.env.local");

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  headers: async () => {
    // Workaround: imported lazily with the ".ts" extension because `next dev` and `next build`
    // load this file with Node's native TypeScript support, while next/jest (which never calls
    // headers()) uses a legacy loader that cannot resolve local imports.
    const { securityHeaders } = await import("./lib/security-headers.ts");
    return [
      {
        source: "/:path*",
        headers: securityHeaders(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

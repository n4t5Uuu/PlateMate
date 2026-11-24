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

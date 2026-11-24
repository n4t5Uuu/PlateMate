import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read env files itself; load the repo root one (cwd is backend/db).
if (existsSync("../../.env.local")) process.loadEnvFile("../../.env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Neon migrations need the direct URL, not the pooled one. Falls back to the local docker compose database.
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      "postgresql://platemate:platemate@localhost:5432/platemate",
  },
});

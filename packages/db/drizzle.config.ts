import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Falls back to the local docker compose database.
    url:
      process.env.DATABASE_URL ??
      "postgresql://platemate:platemate@localhost:5432/platemate",
  },
});

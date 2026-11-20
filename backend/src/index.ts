import { serve } from "@hono/node-server";
import { db, sql } from "@platemate/db";
import { Hono } from "hono";
import { files } from "./storage";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/health/db", async (c) => {
    await db.execute(sql`select 1`);
    return c.json({ ok: true });
  })
  .get("/health/storage", async (c) => {
    await files.exists("health-check");
    return c.json({ ok: true });
  });

serve({ fetch: app.fetch, port: 8787 });

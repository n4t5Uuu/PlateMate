import { serve } from "@hono/node-server";
import { Hono } from "hono";

export const app = new Hono().get("/health", (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: 8787 });

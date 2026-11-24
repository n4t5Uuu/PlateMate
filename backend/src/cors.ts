import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { parseAppUrl } from "./env";

/**
 * CORS for the browser app: only the APP_URL origin, no credentials.
 * Takes the raw value and checks only APP_URL, so the Clerk keys are still not needed at import.
 * APP_URL is required: a missing or invalid value throws when the backend starts, because CORS cannot be set without it.
 * The errors name the variable and never print its value.
 */
export function appCors(appUrl: string | undefined): MiddlewareHandler {
  const allowed = new URL(parseAppUrl(appUrl)).origin;
  const allow = cors({
    origin: allowed,
    allowHeaders: ["Authorization", "Content-Type"],
  });
  // Skip hono's middleware for other origins: it adds Allow-Headers to their preflights too.
  return (c, next) =>
    c.req.header("Origin") === allowed ? allow(c, next) : next();
}

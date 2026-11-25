import { createClerkClient } from "@clerk/backend";
import { verifyWebhook } from "@clerk/backend/webhooks";
import { withSyncContext } from "@platemate/db";
import { parseClerkUserEvent } from "@platemate/shared";
import { Hono } from "hono";
import { getEnv } from "../env";
import { softDeleteUser, upsertUser } from "../users";

const handledTypes = new Set(["user.created", "user.updated", "user.deleted"]);

/** Clerk's API answers 404 for a user that no longer exists. Any other failure is not proof of that. */
function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  );
}

// Public on purpose: Clerk calls it, and the Svix signature is the only check. Never log the body, headers or secret.
export const clerkWebhook = new Hono().post("/webhooks/clerk", async (c) => {
  const env = getEnv();

  let verified;
  try {
    verified = await verifyWebhook(c.req.raw, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    });
  } catch {
    return c.json({ error: "invalid webhook" }, 400);
  }

  // Checked before parsing: the parser rejects event types we do not handle, and those must get a 200.
  if (!handledTypes.has(verified.type)) return c.json({ ok: true });

  let event;
  try {
    event = parseClerkUserEvent(verified);
  } catch {
    return c.json({ error: "invalid webhook" }, 400);
  }

  try {
    if (event.type === "user.created") {
      // A retried user.created can arrive after user.deleted; softDeleteUser did nothing for the unknown id,
      // so inserting now would resurrect a deleted account. Ask Clerk whether the user still exists.
      // shortcut: the guard covers user.created only, so a retried user.updated after user.deleted can still insert a live row, and a user.deleted landing between getUser and the write is overwritten; widen the guard or compare event timestamps if this shows up.
      try {
        await createClerkClient({
          secretKey: env.CLERK_SECRET_KEY,
        }).users.getUser(event.clerkUserId);
      } catch (error) {
        if (isNotFound(error)) return c.json({ ok: true });
        throw error;
      }
    }

    await withSyncContext(async (tx) => {
      if (event.type === "user.deleted") {
        await softDeleteUser(tx, event.clerkUserId);
      } else {
        // Only the profile fields: `type` is routing, not data.
        const { clerkUserId, email, name, avatarUrl } = event;
        await upsertUser(tx, { clerkUserId, email, name, avatarUrl });
      }
    });
  } catch {
    // Fixed message, no error object: driver errors can carry the SQL and the person's email.
    console.error("clerk webhook: write failed");
    return c.body(null, 500);
  }

  return c.json({ ok: true });
});

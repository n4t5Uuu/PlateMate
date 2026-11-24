import { sql, type ExtractTablesWithRelations, type SQL } from "drizzle-orm";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import { db } from "./client";
import type * as schema from "./schema";

export type Transaction = PgTransaction<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

// shortcut: the connection is the table owner (it runs migrations) and each transaction only drops to platemate_app,
// so a handler that skips these helpers and queries `db` directly runs as the owner and bypasses RLS.
// Upgrade to a separate login role for the app with its own connection string when the Neon branches exist (issue #37).
//
// Works on both drivers: `db.transaction` pins one connection (Neon's WebSocket Pool client, postgres.js `begin`),
// and both roll back when the callback throws. Neon's HTTP driver has no interactive transactions and is not used.
async function inContext<T>(
  setting: SQL,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // `set local role` takes no parameters; the role name is a constant. Values go in as parameters.
    await tx.execute(sql`set local role platemate_app`);
    await tx.execute(setting);
    return fn(tx);
  });
}

/** Runs `fn` as `platemate_app` with `app.clerk_user_id` set for this transaction only. */
export function withUserContext<T>(
  clerkUserId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  if (typeof clerkUserId !== "string" || clerkUserId.trim() === "") {
    return Promise.reject(new Error("A Clerk user id is required."));
  }
  return inContext(
    sql`select set_config('app.clerk_user_id', ${clerkUserId}, true)`,
    fn,
  );
}

// shortcut: `app.actor` guards against a missing-WHERE bug, not against code that deliberately calls this;
// only the webhook handler may. Upgrade to a dedicated sync role if more callers appear.
/** Runs `fn` as `platemate_app` with `app.actor = 'clerk-sync'` and no user id, for the Clerk webhook sync. */
export function withSyncContext<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return inContext(
    sql`select set_config('app.actor', ${"clerk-sync"}, true)`,
    fn,
  );
}

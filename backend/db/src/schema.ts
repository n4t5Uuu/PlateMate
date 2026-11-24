import { sql } from "drizzle-orm";
import {
  pgPolicy,
  pgRole,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Tables go here (workspaces, projects, plates, versions, annotations...).
// Every table needs `.enableRLS()` and policies for `platemate_app` (see specs/001-user-auth/data-model.md).

// The role every request handler runs as (`set local role platemate_app`). Drizzle emits `CREATE ROLE` with
// Postgres defaults, so it is NOLOGIN, NOSUPERUSER and NOBYPASSRLS, and row-level security applies to it.
export const platemateApp = pgRole("platemate_app");

// People, synced from Clerk. The backend sets `app.clerk_user_id` (the signed-in person) and `app.actor`
// (`clerk-sync` in the webhook handler only) inside each transaction; unset means null, which denies.
const isSelf = sql`clerk_user_id = current_setting('app.clerk_user_id', true)`;
const isClerkSync = sql`current_setting('app.actor', true) = 'clerk-sync'`;

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    // Stored lowercased and trimmed by the sync code; unique only among live rows (see the index below).
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_live_unique")
      .on(t.email)
      .where(sql`${t.deletedAt} is null`),
    pgPolicy("users_select", {
      for: "select",
      to: platemateApp,
      using: sql`${isSelf} or ${isClerkSync}`,
    }),
    pgPolicy("users_insert", {
      for: "insert",
      to: platemateApp,
      withCheck: sql`${isSelf} or ${isClerkSync}`,
    }),
    pgPolicy("users_update", {
      for: "update",
      to: platemateApp,
      using: isClerkSync,
      withCheck: isClerkSync,
    }),
    // No delete policy on purpose: rows are soft-deleted through `deleted_at`.
  ],
).enableRLS();

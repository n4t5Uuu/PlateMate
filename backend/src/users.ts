import { and, eq, isNull, users, type Transaction } from "@platemate/db";
import type { ClerkUserProfile } from "@platemate/shared";

export type User = typeof users.$inferSelect;

/** Emails are stored and compared lowercased and trimmed. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// shortcut: `users_update` allows only the clerk-sync actor, and Postgres checks the UPDATE policy on the
// `on conflict do update` branch. So this works in `withSyncContext` (webhook), but in `withUserContext` it is
// refused when the row already exists (two first requests racing). The person-path caller must catch that and
// re-find the row with `findActiveUserByClerkId`; upgrade if profile editing gets its own update policy.
/** Creates the user or refreshes name, email, avatar and `updated_at`. Idempotent, keyed by `clerk_user_id`. */
export async function upsertUser(
  tx: Transaction,
  profile: ClerkUserProfile,
): Promise<User> {
  const fields = {
    email: normalizeEmail(profile.email),
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    updatedAt: new Date(),
  };
  // `deleted_at` is not in the update set: a deleted person stays deleted.
  const [user] = await tx
    .insert(users)
    .values({ clerkUserId: profile.clerkUserId, ...fields })
    .onConflictDoUpdate({ target: users.clerkUserId, set: fields })
    .returning();
  return user;
}

/** Sets `deleted_at` and keeps the row. Does nothing for an unknown or already deleted id. */
export async function softDeleteUser(
  tx: Transaction,
  clerkUserId: string,
): Promise<void> {
  const now = new Date();
  await tx
    .update(users)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(eq(users.clerkUserId, clerkUserId), isNull(users.deletedAt)));
}

export async function findActiveUserByClerkId(
  tx: Transaction,
  clerkUserId: string,
): Promise<User | null> {
  const [user] = await tx
    .select()
    .from(users)
    .where(and(eq(users.clerkUserId, clerkUserId), isNull(users.deletedAt)))
    .limit(1);
  return user ?? null;
}

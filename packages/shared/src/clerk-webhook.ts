import { z } from "zod";

// Rejects blank and whitespace-only values but keeps them as sent (normalizing is not this file's job).
const nonBlank = z
  .string()
  .refine((value) => value.trim().length > 0, "must not be blank");

// Only the fields we read; Zod strips everything else. Clerk sends null for unset names and primary email id.
const clerkUserSchema = z.object({
  id: nonBlank,
  email_addresses: z.array(
    z.object({ id: z.string(), email_address: nonBlank }),
  ),
  primary_email_address_id: z.string().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  image_url: z.string().nullish(),
});

const clerkUserEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.enum(["user.created", "user.updated"]),
    data: clerkUserSchema,
  }),
  // user.deleted carries a deleted-object payload, not a user: we only need the id (it can be missing, so it is required here).
  z.object({
    type: z.literal("user.deleted"),
    data: z.object({ id: nonBlank }),
  }),
]);

/** The fields Clerk owns, as `parseClerkUserEvent` returns them. */
export type ClerkUserProfile = {
  clerkUserId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type ClerkUserEvent =
  | ({ type: "user.created" | "user.updated" } & ClerkUserProfile)
  | { type: "user.deleted"; clerkUserId: string };

const parsedEventSchema = clerkUserEventSchema.transform(
  (event, ctx): ClerkUserEvent => {
    if (event.type === "user.deleted")
      return { type: event.type, clerkUserId: event.data.id };

    const {
      id,
      email_addresses,
      primary_email_address_id,
      first_name,
      last_name,
      image_url,
    } = event.data;
    const primary = email_addresses.find(
      (address) => address.id === primary_email_address_id,
    );
    if (!primary) {
      ctx.issues.push({
        code: "custom",
        message: "no primary email address",
        input: event.data,
        path: ["data", "primary_email_address_id"],
      });
      return z.NEVER;
    }

    return {
      type: event.type,
      clerkUserId: id,
      // Not normalized here: lowercasing and trimming is normalizeEmail's job.
      email: primary.email_address,
      name:
        [first_name, last_name]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(" ") || null,
      avatarUrl: image_url ?? null,
    };
  },
);

/** Maps a verified Clerk user event to our fields. Throws a ZodError when the event is malformed. */
export function parseClerkUserEvent(event: unknown): ClerkUserEvent {
  return parsedEventSchema.parse(event);
}

import { parseClerkUserEvent, type ClerkUserEvent } from "@platemate/shared";
import type { upsertUser } from "../src/users";

// What the webhook route (T023) relies on. The type checks here fail `pnpm typecheck` if the shared event
// union or `ClerkUserProfile` drifts from what `upsertUser` takes; the runtime check pins the parsed shape.
type UpsertProfile = Parameters<typeof upsertUser>[1];

// Never called: it exists to be compiled.
export function routeGlue(event: ClerkUserEvent): string {
  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const profile: UpsertProfile = event; // no cast
      return profile.clerkUserId;
    }
    case "user.deleted": {
      // @ts-expect-error a deleted event carries no email
      void event.email;
      return event.clerkUserId;
    }
  }
}

describe("parseClerkUserEvent output as the webhook route uses it", () => {
  it("gives a created event exactly type plus the four profile fields", () => {
    const event = parseClerkUserEvent({
      type: "user.created",
      data: {
        id: "user_1",
        email_addresses: [{ id: "idn_1", email_address: "a@example.com" }],
        primary_email_address_id: "idn_1",
        first_name: "Ada",
        last_name: null,
        image_url: null,
      },
    });
    expect(Object.keys(event).sort()).toEqual(
      ["avatarUrl", "clerkUserId", "email", "name", "type"].sort(),
    );
    expect(routeGlue(event)).toBe("user_1");
  });

  it("gives a deleted event only type and clerkUserId", () => {
    const event = parseClerkUserEvent({
      type: "user.deleted",
      data: { id: "user_2" },
    });
    expect(event).toEqual({ type: "user.deleted", clerkUserId: "user_2" });
    expect(routeGlue(event)).toBe("user_2");
  });
});

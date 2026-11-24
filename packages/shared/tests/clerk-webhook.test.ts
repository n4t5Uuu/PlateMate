import { ZodError } from "zod";
import { parseClerkUserEvent } from "../src/clerk-webhook";

const userData = {
  id: "user_123",
  email_addresses: [
    { id: "idn_1", email_address: "Old@Example.com" },
    { id: "idn_2", email_address: " Ada@Example.com " },
  ],
  primary_email_address_id: "idn_2",
  first_name: "Ada",
  last_name: "Lovelace",
  image_url: "https://img.clerk.com/ada.png",
};

const created = (data: Record<string, unknown>) => ({
  type: "user.created",
  data,
});

describe("parseClerkUserEvent", () => {
  it("maps a user.created event to our fields, keeping the email as Clerk sent it", () => {
    expect(parseClerkUserEvent(created(userData))).toEqual({
      type: "user.created",
      clerkUserId: "user_123",
      email: " Ada@Example.com ",
      name: "Ada Lovelace",
      avatarUrl: "https://img.clerk.com/ada.png",
    });
  });

  it("maps user.updated the same way", () => {
    const parsed = parseClerkUserEvent({
      type: "user.updated",
      data: userData,
    });
    expect(parsed).toMatchObject({
      type: "user.updated",
      clerkUserId: "user_123",
    });
  });

  it("gives a null name when both names are null or empty", () => {
    const parsed = parseClerkUserEvent(
      created({ ...userData, first_name: null, last_name: "" }),
    );
    expect(parsed).toMatchObject({ name: null });
  });

  it("gives a null name when the names are only whitespace", () => {
    const parsed = parseClerkUserEvent(
      created({ ...userData, first_name: "  ", last_name: " " }),
    );
    expect(parsed).toMatchObject({ name: null });
  });

  it("drops a whitespace-only name and trims the other", () => {
    const parsed = parseClerkUserEvent(
      created({ ...userData, first_name: " Ada ", last_name: "  " }),
    );
    expect(parsed).toMatchObject({ name: "Ada" });
  });

  it("uses the one name that exists", () => {
    const parsed = parseClerkUserEvent(
      created({ ...userData, last_name: null }),
    );
    expect(parsed).toMatchObject({ name: "Ada" });
  });

  it("gives a null avatar when there is no image", () => {
    const parsed = parseClerkUserEvent(
      created({ ...userData, image_url: null }),
    );
    expect(parsed).toMatchObject({ avatarUrl: null });
  });

  it.each([undefined, "", null])("rejects a missing user id (%p)", (id) => {
    expect(() => parseClerkUserEvent(created({ ...userData, id }))).toThrow(
      ZodError,
    );
  });

  it("rejects an email address that is empty", () => {
    expect(() =>
      parseClerkUserEvent(
        created({
          ...userData,
          email_addresses: [{ id: "idn_1", email_address: "" }],
          primary_email_address_id: "idn_1",
        }),
      ),
    ).toThrow(ZodError);
  });

  // Finding: the email is trimmed and lowercased downstream, so a blank one would become "" in the users table.
  it("rejects an email address that is only whitespace", () => {
    expect(() =>
      parseClerkUserEvent(
        created({
          ...userData,
          email_addresses: [{ id: "idn_1", email_address: "   " }],
          primary_email_address_id: "idn_1",
        }),
      ),
    ).toThrow(ZodError);
  });

  it("rejects a user.deleted event with no id", () => {
    expect(() =>
      parseClerkUserEvent({
        type: "user.deleted",
        data: { deleted: true, object: "user" },
      }),
    ).toThrow(ZodError);
  });

  it.each([
    ["has an empty id", { id: "" }],
    ["has a null id", { id: null }],
    ["has a non-string id", { id: 42 }],
    ["has no data fields", {}],
  ])("rejects a user.deleted event that %s", (_case, data) => {
    expect(() => parseClerkUserEvent({ type: "user.deleted", data })).toThrow(
      ZodError,
    );
  });

  it("rejects a user.deleted event with no data", () => {
    expect(() => parseClerkUserEvent({ type: "user.deleted" })).toThrow(
      ZodError,
    );
  });

  // Finding: a whitespace-only id is not a real Clerk id; accepting it would write or delete a row keyed on blanks.
  it.each(["user.deleted", "user.created"])(
    "rejects a whitespace-only user id on %s",
    (type) => {
      const data =
        type === "user.deleted" ? { id: "   " } : { ...userData, id: "   " };
      expect(() => parseClerkUserEvent({ type, data })).toThrow(ZodError);
    },
  );

  it("gives a null name and avatar when those fields are absent", () => {
    const bare = {
      ...userData,
      first_name: undefined,
      last_name: undefined,
      image_url: undefined,
    };
    expect(parseClerkUserEvent(created(bare))).toMatchObject({
      name: null,
      avatarUrl: null,
    });
  });

  it("keeps an inner space and trims both names", () => {
    const parsed = parseClerkUserEvent(
      created({
        ...userData,
        first_name: " Ada Augusta ",
        last_name: " King ",
      }),
    );
    expect(parsed).toMatchObject({ name: "Ada Augusta King" });
  });

  it("uses the address marked primary, not the first one listed", () => {
    const parsed = parseClerkUserEvent(
      created({ ...userData, primary_email_address_id: "idn_1" }),
    );
    expect(parsed).toMatchObject({ email: "Old@Example.com" });
  });

  it("rejects an email address entry with no email_address", () => {
    expect(() =>
      parseClerkUserEvent(
        created({
          ...userData,
          email_addresses: [{ id: "idn_2" }],
        }),
      ),
    ).toThrow(ZodError);
  });

  it("rejects a user.created event with no email_addresses list", () => {
    const noList = { ...userData, email_addresses: undefined };
    expect(() => parseClerkUserEvent(created(noList))).toThrow(ZodError);
  });

  it("reads only the id from a user.deleted event", () => {
    expect(
      parseClerkUserEvent({
        type: "user.deleted",
        data: { id: "user_123", deleted: true, object: "user" },
      }),
    ).toEqual({ type: "user.deleted", clerkUserId: "user_123" });
  });

  it.each([
    ["has no primary email id", { primary_email_address_id: null }],
    ["omits the primary email id", { primary_email_address_id: undefined }],
    ["points at an unknown email", { primary_email_address_id: "idn_missing" }],
    ["has no email addresses", { email_addresses: [] }],
  ])("rejects a user.created event that %s", (_case, override) => {
    expect(() =>
      parseClerkUserEvent(created({ ...userData, ...override })),
    ).toThrow(ZodError);
  });

  it("ignores fields we do not read", () => {
    const parsed = parseClerkUserEvent({
      type: "user.created",
      object: "event",
      data: { ...userData, banned: false, phone_numbers: [{ id: "idn_9" }] },
    });
    expect(parsed).toEqual({
      type: "user.created",
      clerkUserId: "user_123",
      email: " Ada@Example.com ",
      name: "Ada Lovelace",
      avatarUrl: "https://img.clerk.com/ada.png",
    });
  });

  it("rejects an event type we do not handle", () => {
    expect(() =>
      parseClerkUserEvent({ type: "session.created", data: userData }),
    ).toThrow(ZodError);
  });

  it.each([null, undefined, "user.created", 7, [], {}])(
    "rejects something that is not an event (%p)",
    (input) => {
      expect(() => parseClerkUserEvent(input)).toThrow(ZodError);
    },
  );

  it("rejects user.created whose data is not an object", () => {
    expect(() => parseClerkUserEvent(created(null as never))).toThrow(ZodError);
  });

  it("does not echo the event's email into the error", () => {
    try {
      parseClerkUserEvent(
        created({ ...userData, primary_email_address_id: null }),
      );
    } catch (error) {
      expect(JSON.stringify((error as ZodError).issues)).not.toContain(
        "Ada@Example.com",
      );
      return;
    }
    throw new Error("parseClerkUserEvent did not throw");
  });
});

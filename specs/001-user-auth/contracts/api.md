# Contract: Backend API (auth surface)

**Feature**: [spec.md](../spec.md) | **Data**: [data-model.md](../data-model.md)

Base address in development: `http://localhost:8787`. All request and response bodies are JSON unless stated. These are the only routes this feature adds; the existing `/health`, `/health/db` and `/health/storage` stay public and unchanged.

## Authentication of private routes

Every route marked **private** requires the header `Authorization: Bearer <Clerk session token>`. The backend verifies it with Clerk on every request (FR-013). A missing, malformed, expired or invalid token gets:

```json
HTTP 401
{ "error": "unauthorized" }
```

No route reveals whether an account exists (FR-007), and no private data is returned on a 401.

## Data access rule (row-level security)

Every query behind these routes runs inside `withUserContext` (private routes) or `withSyncContext` (the webhook), so the database itself enforces who can see and change a row ([data-model.md](../data-model.md)). A caller can only ever read their own `users` row; a row that belongs to someone else behaves as if it did not exist. No route accepts a user id from the client.

## GET /me (private)

Returns the signed-in person's PlateMate record. Used by the signed-in home page, and as the end-to-end check that session, token, verification and the user record all work.

| Case | Response |
| --- | --- |
| Valid token, record exists | `200` `{ "id": "uuid", "email": "person@example.com", "name": "Ada Lovelace" or null, "avatarUrl": "https://..." or null, "createdAt": "2026-11-21T10:00:00.000Z" }` |
| Valid token, no record yet | The record is created first (just-in-time sync, research R5), then `200` as above |
| Valid token, record soft-deleted | `401` `{ "error": "unauthorized" }` |
| Invalid or missing token | `401` `{ "error": "unauthorized" }` |

## POST /webhooks/clerk (public, signature-checked)

Receives account events from Clerk. Public because Clerk calls it, but every request must carry a valid Clerk (Svix) signature, checked with the signing secret.

| Case | Response |
| --- | --- |
| Valid signature, event is `user.created`, `user.updated` or `user.deleted` | `200` `{ "ok": true }` after the idempotent write |
| Valid signature, any other event type | `200` `{ "ok": true }`, ignored |
| Missing or invalid signature, or unreadable body | `400` `{ "error": "invalid webhook" }`, nothing written |
| Valid event but the database write fails | `500`, so Clerk retries |

**Fields read from the event** (everything else is ignored): the Clerk user id; the primary email address (the entry whose id equals `primary_email_address_id`); first name, last name; `image_url`. Parsed with a Zod schema; an event missing the user id or a primary email on create is rejected with `400`.

## CORS

The backend answers browser requests from the app origin (`APP_URL`) only, allows the `Authorization` and `Content-Type` headers, and does not allow credentials-based cookies. Other origins get no CORS headers.

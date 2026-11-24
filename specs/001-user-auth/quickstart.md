# Quickstart: Validating User Authentication

**Feature**: [spec.md](spec.md) | **Contracts**: [api](contracts/api.md), [routes](contracts/routes.md) | **Data**: [data-model.md](data-model.md)

A runnable checklist to prove the feature works end to end. It does not contain implementation code.

## Prerequisites

- Docker Desktop running; `pnpm install` done.
- A Clerk application (the one chosen in the Clerk Dashboard) with, in its Dashboard: email and password, emailed sign-in link, Google and Microsoft turned on; **Multi-factor** page: authenticator app and backup codes on, SMS off, **Require multi-factor authentication** on. Use the **development** instance (MFA is free there).
- Keys in the git-ignored env files (names in research R8; values come from the Clerk Dashboard). Never commit them.
- Database ready: `pnpm dev`, then `pnpm db:sync` (local only; it wipes local data).
- For the webhook scenario: a public tunnel to the backend and its address added as a webhook endpoint in Clerk, subscribed to `user.created`, `user.updated`, `user.deleted`.

## Automated checks

```bash
pnpm quality      # lint, types, react-doctor, tests, audit
pnpm build
pnpm smoke        # backend running; includes the new auth checks
```

Expected: all pass. `pnpm test` includes the public-route list, the authentication middleware (Clerk verification stubbed), webhook payload parsing and email normalization.

## Scenario 1: Sign up with two-step setup (User Stories 1 and 7)

1. Open `http://localhost:3000/sign-up` in a private window.
2. Sign up with a new email and a password that meets the rules, then enter the emailed confirmation.
3. **Expect**: before reaching the app you are asked to set up two-step verification. Scan the code with an authenticator app, enter a valid code, and see backup codes once.
4. **Expect**: you land on `/` showing your email. Reload: still signed in.
5. Close the window midway through step 3 in another run: **expect** the next log-in returns you to setup.

## Scenario 2: Log in (User Story 2)

1. Sign out, open `/sign-in`, enter email and password, then the authenticator code.
2. **Expect**: you reach `/`. Repeat with the emailed sign-in link, then with an unused backup code (it must not work a second time).
3. Enter a wrong password and a non-existent email: **expect** the same general message in both cases (SC-008).
4. Fail the password 5 times: **expect** a wait message (check the actual limit in the dashboard, research R11).

## Scenario 3: Private pages and the server check (User Story 3, FR-013)

1. Signed out, open `http://localhost:3000/some-page`: **expect** a redirect to `/sign-in`, and after logging in you arrive at `/some-page`.
2. `curl -i http://localhost:8787/me` with no header: **expect** `401` and `{"error":"unauthorized"}`.
3. Signed in, call `/me` with the session token as a bearer header: **expect** `200` with your record. A second call returns the same `id` (no duplicate).
4. Open `/sign-in?redirect_url=https://example.com` while logged in and after logging in: **expect** you stay on PlateMate (only same-site return addresses).

## Scenario 4: Google and Microsoft (User Story 4) and the open risks from research R2

1. Sign up with a Google account, then log in again; then the same with Microsoft and with the same email as an existing password account.
2. **Expect**: one account per person (one row in `users`), and a second-step prompt on each log-in.
3. **Record the result**: if the social log-in skips the second step, FR-020 is not met by configuration. Stop and ask the product owner which fallback to take (research R2, risk 2).
4. While signed in, open the account security settings and try to remove your authenticator: **record whether it is possible**. If it is, FR-021 needs a block (research R2, risk 3).

## Scenario 5: Sign out (User Story 5)

1. Sign out: **expect** `/sign-in`. Press the browser's back button: **expect** no private content, only the log-in page.

## Scenario 6: User record sync (FR-014, SC-005)

1. After Scenario 1, query the local database: **expect** exactly one `users` row for your email within a minute, with the Clerk user id set.
2. Change your name in your account settings: **expect** the row's name and `updated_at` change (needs the webhook tunnel).
3. Delete the account in the Clerk Dashboard: **expect** `deleted_at` set, row kept, and `/me` returns `401`.
4. Send the same webhook twice (replay it from the Clerk Dashboard): **expect** still one row.
5. Post to `/webhooks/clerk` with no signature: **expect** `400` and no change.

## Scenario 7: Accessibility and speed (FR-016, SC-006, SC-007)

1. Complete sign-up and log-in using only the keyboard; check every field has a label.
2. Run the page speed check on `/sign-in`: **expect** Largest Contentful Paint under 2.5 seconds.

## Scenario 8: Row-level security (FR-022, SC-011)

1. With the local database up and the schema pushed, run `pnpm db:verify-rls`.
2. **Expect** it to pass: with no context nothing is visible; a person sees only their own `users` row; they cannot create or edit another person's row; nothing can be deleted; the sync actor can upsert.
3. Add a throwaway table without RLS in a scratch database and rerun: **expect** the check to fail and name the table. Remove it.
4. Search the backend for queries that skip the context helper: **expect** none in request handlers.

## Scenario 9: Cross-site scripting (FR-023, SC-012)

1. In your Clerk account settings set the first name to `<img src=x onerror=alert(1)>`, sign in, and open `/`.
2. **Expect** the name appears as literal text and nothing runs (no alert, no broken image request).
3. Open the browser's developer tools on `/sign-in` and `/`: **expect** the `Content-Security-Policy` (or report-only) header, `X-Content-Type-Options: nosniff` and no console reports about blocked Clerk scripts after the policy is enforced.
4. Run `pnpm lint`: **expect** it to fail if anyone adds `dangerouslySetInnerHTML` (the `react/no-danger` rule).

## Done when

All automated checks pass, Scenarios 1 to 9 behave as expected, and the two risk checks in Scenario 4 are recorded in `research.md`.

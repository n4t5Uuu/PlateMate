---

description: "Task list for User Authentication (Sign Up and Log In)"
---

# Tasks: User Authentication (Sign Up and Log In)

**Input**: Design documents from `/specs/001-user-auth/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. The constitution (principle II) requires Jest tests for validation and permission logic, so test tasks come before the code they cover. Database behavior and real-Clerk behavior is validated through `pnpm db:verify-rls`, `pnpm smoke` and the quickstart scenarios, because CI has no database yet (research R10, issue #36).

**Organization**: Tasks are grouped by user story. US1, US2, US3 and US7 are all P1 and together form the minimum shippable sign-in, because two-step verification is required for every account and never optional (spec FR-018 to FR-021). No new dependencies are added; everything uses packages already in the repo. Row-level security is always on (FR-022) and the XSS defenses are part of the foundation (FR-023).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: Which user story the task belongs to (US1 to US7)
- Paths are from the repository root

## How to run these tasks

Each code task goes through the coder, reviewer and tester agents (see `CLAUDE.md`, "Agent workflow"). Visual UI tasks use the `impeccable` skill and `frontend/CLAUDE.md`, and **the user picks the layout** when Impeccable asks. Tasks marked **(manual)** are done by a person in the Clerk Dashboard, Neon or a terminal. Never read, print or commit env files; use the variable names in research R8. Schema changes only through `backend/db/src/schema.ts` and `pnpm db:push`, never hand-written SQL.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch, keys, and confirmation of the Clerk and Drizzle APIs the plan relies on

- [x] T001 Create the feature branch `feat/user-auth` from `dev` (`git switch -c feat/user-auth`)
- [x] T002 (manual) Pick the Clerk **development** application chosen in the Clerk Dashboard, run `npx -y clerk@latest auth login` in your own terminal, and put the keys into the git-ignored root `.env.local` by hand (both apps read it): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Do not paste key values into chat or tracked files
- [x] T003 [P] Add the Clerk variable names with empty values to `.env.example`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`, `NEXT_PUBLIC_API_URL=http://localhost:8787`, `CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `APP_URL=http://localhost:3000`
- [x] T004 [P] Read the installed package types and add a section "Confirmed from installed types" to `specs/001-user-auth/research.md` covering: `createRouteMatcher` and `auth.protect()` in `@clerk/nextjs/server` (7.9.25); the props of `<SignIn />` and `<SignUp />` and how session tasks (such as the two-step setup) are rendered; `authenticateRequest` and `treatPendingAsSignedOut` in `@clerk/backend` (3.27.0, `dist/tokens/authObjects.d.ts`); the `WebhookEvent` shape returned by `verifyWebhook`; and Drizzle's `pgRole`, `pgPolicy` and `.enableRLS()` (`drizzle-orm` 0.45.4) plus the `entities.roles` option of `drizzle-kit` 0.31.11. Correct any statement in the plan that the types contradict
- [x] T005 [P] Spike, local only (Docker Desktop must be running): on the Docker Postgres confirm that the owner can create a non-login role and then run `set local role platemate_app` inside a transaction, and that `select` as that role is filtered by an RLS policy while the owner bypasses it. Record what was needed (including whether a one-time `grant` of the role to the owner is required, which is an infrastructure step and not a schema change) in `specs/001-user-auth/research.md` under R12. If the owner cannot assume the role, switch R12 to the fallback (a separate login role with its own connection string) before T010

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared pieces every story needs: shared schema, validated environment, the `users` table with its role and RLS, the context helper, the users functions, CORS, the Clerk provider and the XSS defenses

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Add `"exports": { ".": "./src/index.ts" }` to `packages/shared/package.json` and create `packages/shared/src/index.ts` re-exporting `./clerk-webhook` (`backend` already depends on `@platemate/shared`)
- [x] T007 [P] Create `packages/shared/src/clerk-webhook.ts`: a Zod schema for the only fields we read from a Clerk user event (Clerk user id; email addresses with `id` and `email_address`; `primary_email_address_id`; `first_name`; `last_name`; `image_url`) and an exported `parseClerkUserEvent` that returns the mapped fields (`clerkUserId`, `email`, `name`, `avatarUrl`) or throws a validation error; a `user.created` event with no user id or no primary email MUST be rejected (contracts/api.md)
- [x] T008 [P] Create `backend/src/env.ts`: a Zod-validated read of `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET` and `APP_URL`, failing at startup with a message that names the missing variable and never prints values (constitution IV)
- [x] T009 [P] Update `backend/db/drizzle.config.ts` with the `entities.roles` option (syntax confirmed in T004) so `pnpm db:push` manages the `platemate_app` role
- [x] T010 Add to `backend/db/src/schema.ts`, exactly per data-model.md: the role `platemate_app` (`pgRole`, not a superuser, no `BYPASSRLS`); the `users` table with `.enableRLS()`; and the three policies. Fields: `id` uuid primary key generated by the database; `clerk_user_id` text, "Required, unique, not editable"; `email` text, "Required. Stored lowercased and trimmed. Unique among rows that are not deleted"; `name` text, "Nullable"; `avatar_url` text, "Nullable"; `created_at` timestamp with time zone, "Required, defaults to now"; `updated_at` timestamp with time zone, "Required, set on every sync"; `deleted_at` timestamp with time zone, "Nullable" (soft delete). Policies for `platemate_app`: `users_select` using `clerk_user_id = current_setting('app.clerk_user_id', true)` or `current_setting('app.actor', true) = 'clerk-sync'`; `users_insert` with the same condition as `with check`; `users_update` using and with check `current_setting('app.actor', true) = 'clerk-sync'` only; **no delete policy**. Then run `pnpm db:generate` and `pnpm db:migrate` (not `pnpm db:push`: it drops policy conditions) and confirm in `pnpm db:studio` or a query that RLS is on. Never hand-write SQL (constitution IV)
- [x] T011 [P] Write the tests first in `backend/tests/with-context.test.ts` using a fake transaction that records the statements it receives: `withUserContext(clerkUserId, fn)` runs `set local role platemate_app` and the `app.clerk_user_id` setting **before** `fn`, passes values as parameters (never string-built SQL), uses transaction-local settings (`set_config(..., true)`), rejects an empty or missing id, and rolls back when `fn` throws; `withSyncContext(fn)` sets `app.actor` to `clerk-sync` and no user id
- [x] T012 Create `backend/db/src/with-context.ts` (exported from `backend/db/src/index.ts`) with `withUserContext` and `withSyncContext`, implemented as in data-model.md ("How the app uses it") with a `shortcut:` comment stating the limit (the connection is the owner, a handler that skips the helper would bypass RLS) and the upgrade path (a separate login role, issue #37); make T011 pass
- [x] T013 [P] Create `backend/db/src/verify-rls.ts` plus a `verify-rls` script in `backend/db/package.json` and a root `db:verify-rls` script in `package.json`. Like the seed script it MUST refuse a non-local `DATABASE_URL`. Inside a transaction that is rolled back, as `platemate_app`, it proves: with no context no rows are visible; a person sees only their own row; a person cannot insert or update another person's row; nothing can be deleted; the sync actor can upsert. It also queries `pg_class` and **fails, naming the table, if any table in the public schema has RLS switched off**
- [x] T014 [P] Write the tests first in `backend/tests/users.test.ts`: `normalizeEmail` lowercases and trims ("Ada@Example.COM " becomes "ada@example.com"); `upsertUser` called twice with the same `clerkUserId` yields one record and refreshes name, email, avatar and `updated_at`; `softDeleteUser` sets `deleted_at` and keeps the row; `softDeleteUser` for an unknown id does nothing; `user.updated` for an unknown person creates the row; every function takes the context transaction as a parameter and never touches the bare connection. Use an in-memory fake so the test needs no database or network
- [x] T015 Create `backend/src/users.ts` with `normalizeEmail`, `upsertUser` (idempotent, keyed by `clerk_user_id`), `softDeleteUser` and `findActiveUserByClerkId`; each takes the transaction from `with-context.ts` and none queries the bare `db`; make T014 pass
- [x] T016 Add CORS to `backend/src/index.ts` with `hono/cors`: allow only the origin from `APP_URL`, allow the `Authorization` and `Content-Type` headers, no credentials (contracts/api.md, "CORS")
- [x] T017 Wrap the app in Clerk's `ClerkProvider` **inside `<body>`, not around `<html>`** in `frontend/app/layout.tsx` (research R9); keep the existing fonts and metadata
- [x] T018 [P] Set `"react/no-danger": "error"` in `frontend/eslint.config.mjs` and prove it works: add a temporary component using `dangerouslySetInnerHTML`, confirm `pnpm lint` fails, then delete it (research R13)
- [x] T019 [P] Write the tests first in `frontend/tests/security-headers.test.ts` for the function in `frontend/lib/security-headers.ts`: the Content-Security-Policy has no `unsafe-eval`, has `object-src 'none'`, `base-uri 'self'` and `frame-ancestors 'none'`, lists only `'self'` and the Clerk origins from T020 as script sources, and the header set also contains `X-Content-Type-Options: nosniff` and a `Referrer-Policy`
- [x] T020 Read Clerk's content-security-policy guidance (Clerk docs), then create `frontend/lib/security-headers.ts` returning the header set and wire it through `headers()` in `frontend/next.config.ts` as **report-only** first (research R13); allow only the origins Clerk lists. If a static policy cannot allow Clerk without `unsafe-inline`, record the trade-off in research R13 and switch to a nonce-based policy in `frontend/proxy.ts`; make T019 pass
- [x] T021 Run `pnpm db:verify-rls`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`; everything must pass before any story starts

**Checkpoint**: Foundation ready. RLS is proven, the XSS defenses are in place, and all gates pass

---

## Phase 3: User Story 1 - Sign up for a PlateMate account (Priority: P1) MVP

**Goal**: A new person signs up with email and password, confirms their email and lands inside the app, and a PlateMate user record is created for them without a manual step.

**Independent Test**: Quickstart Scenario 1 (steps 1 to 4), Scenario 6 (steps 1, 4, 5) and Scenario 9 (steps 1 and 2): sign up a new email, land on `/`, find exactly one `users` row; replaying the webhook keeps one row; an unsigned webhook is refused; a script-like name shows as text.

### Tests for User Story 1 (write first, confirm they fail)

- [x] T022 [P] [US1] Write `backend/tests/webhook.test.ts` for the handler in contracts/api.md: valid signature plus `user.created` calls `upsertUser` once inside `withSyncContext` and returns `200 {"ok":true}`; the same event delivered twice leaves one record; `user.updated` refreshes the record; `user.deleted` soft-deletes; an unsupported event type returns `200` and writes nothing; a missing or invalid signature returns `400 {"error":"invalid webhook"}` and writes nothing; a `user.created` payload missing a primary email returns `400`; a database failure returns `500`. Stub `verifyWebhook` so no network or secret is needed

### Implementation for User Story 1

- [x] T023 [US1] Create `backend/src/webhooks/clerk.ts`: `POST /webhooks/clerk` that verifies the request with `verifyWebhook` from `@clerk/backend/webhooks` using `CLERK_WEBHOOK_SIGNING_SECRET`, parses with `parseClerkUserEvent` (T007) and applies `user.created`, `user.updated` (`upsertUser`) and `user.deleted` (`softDeleteUser`) inside `withSyncContext`; status codes exactly as in contracts/api.md; make T022 pass. Before inserting on `user.created`, check with Clerk (`getUser`) that the user still exists and skip the insert if not, because a retried `user.created` that arrives after `user.deleted` would otherwise create a live row for a deleted account (`softDeleteUser` does nothing for an unknown id)
- [x] T024 [US1] Mount the webhook route in `backend/src/index.ts`
- [x] T025 [P] [US1] Create `frontend/app/sign-up/[[...sign-up]]/page.tsx` rendering Clerk's `<SignUp />` inside `<Suspense>` (research R1 and R9; `cacheComponents` is on)
- [x] T026 [P] [US1] Replace the create-next-app placeholder in `frontend/app/page.tsx` with a minimal signed-in home: the signed-in person's name and email read with `await currentUser()` inside `<Suspense>`, rendered as plain text through React (never `dangerouslySetInnerHTML`; FR-023). The `/me` call replaces this in T041
- [x] T027 [US1] Run the `impeccable` skill for the sign-up page and the home page (`shape`, then build), following `frontend/CLAUDE.md`, using shadcn components and Clerk's `appearance` options. **The user picks the layout.** Keep the sign-in page (T030) on the same layout
- [x] T028 [US1] (manual) In the Clerk Dashboard: turn on email and password, require email confirmation, set the password rules; add the backend webhook address (a public tunnel to `http://localhost:8787/webhooks/clerk`) subscribed to `user.created`, `user.updated` and `user.deleted`, and copy its signing secret into the backend env as `CLERK_WEBHOOK_SIGNING_SECRET`
- [x] T029 [US1] Validate quickstart Scenario 1 (steps 1 to 4), Scenario 6 (steps 1, 4, 5) and Scenario 9 (steps 1 and 2); fix anything that fails

**Checkpoint**: A new person can sign up and has exactly one PlateMate record

---

## Phase 4: User Story 2 - Log in to an existing account (Priority: P1)

**Goal**: A returning person logs in with email and password or an emailed link, and failed attempts are limited.

**Independent Test**: Quickstart Scenario 2: log in by password and by emailed link; a wrong password and an unknown email show the same message; repeated failures are blocked.

- [ ] T030 [P] [US2] Create `frontend/app/sign-in/[[...sign-in]]/page.tsx` rendering Clerk's `<SignIn />` inside `<Suspense>`
- [ ] T031 [US2] (manual) In the Clerk Dashboard: turn on the emailed sign-in link; set the failed-attempt limit to 5 attempts and a 15-minute block, and the expiry of reset and sign-in links to 1 hour, where Clerk allows it. Write the values Clerk actually offers into a "Clerk settings applied" table in `specs/001-user-auth/research.md` (research R11) and, if any differ from the spec defaults, update the assumption in `specs/001-user-auth/spec.md`
- [ ] T032 [US2] Apply the layout chosen in T027 to the sign-in page through the `impeccable` skill (same appearance options as sign-up)
- [ ] T033 [US2] Validate quickstart Scenario 2 (steps 1 to 4) except the second-step prompts, which come with US7; fix anything that fails

**Checkpoint**: A returning person can log in; error messages never reveal whether an account exists

---

## Phase 5: User Story 3 - Private pages require a log-in (Priority: P1)

**Goal**: Signed-out visitors cannot reach any private page or data. They are sent to log in and returned to the page they wanted, and the server checks who is calling on every private request, with the database enforcing whose row it is.

**Independent Test**: Quickstart Scenarios 3 and 8: a private page redirects when signed out and returns you after login; `curl` to `/me` without a token gets `401`; `/me` with a valid token returns your record; an off-site return address is ignored; `pnpm db:verify-rls` passes.

### Tests for User Story 3 (write first, confirm they fail)

- [ ] T034 [P] [US3] Write `frontend/tests/auth-routes.test.ts`: only `/sign-in` and `/sign-up` and the paths under them are public (`/sign-in`, `/sign-in/factor-one`, `/sign-up/continue`); `/`, `/projects`, `/api/anything`, `/sign-in-evil` and `/sign-upx` are private. This guards the deny-by-default rule (contracts/routes.md)
- [ ] T035 [P] [US3] Write `backend/tests/auth.test.ts` for `requireAuth` with Clerk's verification stubbed: no `Authorization` header returns `401 {"error":"unauthorized"}`; a malformed or invalid token returns 401; a verification error (service down) returns 401 and never data (fails closed, FR-017); a session that is not active (pending two-step setup) returns 401; a valid token for a person with no row calls `upsertUser` once inside `withUserContext` then succeeds; a valid token for a soft-deleted person returns 401; the handler receives the caller's Clerk user id from the verified token and never from the request body or query

### Implementation for User Story 3

- [ ] T036 [US3] Create `frontend/lib/auth-routes.ts` exporting the public route patterns as one constant using `createRouteMatcher`-compatible patterns that end at a path boundary (for example `/sign-in(/.*)?`, so `/sign-in-evil` stays private); make T034 pass
- [ ] T037 [US3] Create `frontend/proxy.ts` (Next.js 16 name; research R3): `clerkMiddleware` that lets the public patterns through, calls `auth.protect()` for everything else, sends a signed-in person who opens `/sign-in` or `/sign-up` to `/`, ensures a session with an unfinished task counts as signed out, and sets `config.matcher` to skip `_next` and static files. Only same-site return addresses may be honored (FR-011)
- [ ] T038 [US3] Create `backend/src/auth.ts`: a Hono middleware `requireAuth` that builds a Clerk client with `createClerkClient` (keys from `backend/src/env.ts`), calls `authenticateRequest` on the incoming request, treats pending sessions as signed out (`treatPendingAsSignedOut`, confirmed in T004), returns `401 {"error":"unauthorized"}` otherwise, then runs `findActiveUserByClerkId` and `upsertUser` inside `withUserContext` as in T035, and puts the Clerk user id on the context; make T035 pass
- [ ] T039 [US3] Add `GET /me` to `backend/src/index.ts` behind `requireAuth`, reading the row inside `withUserContext` and returning `{ id, email, name, avatarUrl, createdAt }` per contracts/api.md. No route takes a user id from the client
- [ ] T040 [P] [US3] Create `frontend/lib/api.ts`: a server-side fetch helper that reads the session token with Clerk's `auth()` (`await auth()`; `getToken()`) and calls `NEXT_PUBLIC_API_URL` with `Authorization: Bearer <token>`, typed with a Zod schema for the `/me` response
- [ ] T041 [US3] Update `frontend/app/page.tsx` to show the name and email from `/me` using T040, inside `<Suspense>`, still rendered as plain text, replacing the Clerk-only version from T026
- [ ] T042 [US3] Add checks to `backend/smoke-test.sh` following its existing pattern: `GET /me` without a token expects `401`; `POST /webhooks/clerk` without a signature expects `400`
- [ ] T043 [US3] Validate quickstart Scenario 3 (steps 1 to 4) and Scenario 8 (all steps, including that no request handler queries without the context helper); fix anything that fails

**Checkpoint**: No private page or data is reachable while signed out (SC-004), and the database refuses cross-person access (SC-011)

---

## Phase 6: User Story 7 - Two-step verification is required for every account (Priority: P1)

**Goal**: Every account has two-step verification set up before first entering the app, every log-in asks for a code, and it can never be skipped or turned off.

**Independent Test**: Quickstart Scenario 1 (steps 3 and 5) and Scenario 2 (second-step prompt and backup code): setup cannot be skipped, an unfinished setup resumes at the next log-in, a backup code works once.

- [ ] T044 [US7] (manual) In the Clerk Dashboard, **Multi-factor** page: turn on the authenticator app and backup codes, leave SMS off, and turn on **Require multi-factor authentication** (research R2). Use the development instance; production needs a paid plan
- [ ] T045 [US7] Confirm the two-step setup task and the code prompt are rendered by the sign-in and sign-up pages from T025 and T030. If the types read in T004 show a separate route or component is needed for the setup task, add it under `frontend/app/sign-in/[[...sign-in]]/` and `frontend/app/sign-up/[[...sign-up]]/`, wrapped in `<Suspense>`
- [ ] T046 [US7] Confirm a person who has not finished setup cannot enter the app or the API: open a fresh sign-up, stop at the setup step, then request `/` and call `/me` with the pending session's token; both must refuse (FR-018). Fix the proxy or `requireAuth` if either lets it through
- [ ] T047 [US7] Validate quickstart Scenario 1 (steps 3 and 5) and Scenario 2 (code prompt, wrong code refused, backup code works once and then not again); fix anything that fails
- [ ] T048 [US7] Try, while signed in, to remove your own authenticator in the account security settings, and record in `specs/001-user-auth/research.md` whether it is possible (research R2, risk 3). If it is, **stop and ask the product owner** how to block it, because FR-021 forbids turning it off and two-step verification is never optional

**Checkpoint**: The P1 set (US1, US2, US3, US7) is complete: sign up, log in, private pages, required two-step verification. This is the minimum to ship sign-in

---

## Phase 7: User Story 4 - Sign in with Google or Microsoft (Priority: P2)

**Goal**: People sign up and log in with Google or Microsoft, always landing on one account per person, and still go through two-step verification.

**Independent Test**: Quickstart Scenario 4.

- [ ] T049 [US4] (manual) In the Clerk Dashboard: turn on Google and Microsoft sign-in, and make sure accounts with the same verified email are linked to one user (FR-006)
- [ ] T050 [US4] Validate quickstart Scenario 4 (steps 1 and 2): sign up with Google, then Microsoft with the same email as an existing password account; confirm there is exactly one `users` row for that email
- [ ] T051 [US4] Check whether a Google or Microsoft log-in is asked for the second step, and record the result in `specs/001-user-auth/research.md` (research R2, risk 2). If it is **not**, FR-020 is not met by configuration: **stop and ask the product owner** to choose between accepting the provider's own protection for social sign-ins or disabling them until Clerk supports it, and update the spec accordingly. Two-step verification stays required either way

**Checkpoint**: Social sign-in works with one account per person

---

## Phase 8: User Story 5 - Sign out (Priority: P2)

**Goal**: A signed-in person can sign out from anywhere in the app, and private content is not shown afterwards.

**Independent Test**: Quickstart Scenario 5.

- [ ] T052 [US5] Add a sign-out control (Clerk's `<UserButton />` or a shadcn button calling Clerk's sign-out) to a header shown on private pages, in `frontend/app/layout.tsx` or a new `frontend/components/site-header.tsx`, wrapped in `<Suspense>`. Use the `impeccable` skill, and **the user picks the layout**
- [ ] T053 [US5] Validate quickstart Scenario 5: sign out lands on `/sign-in`, and the browser's back button shows no private content; fix anything that fails

**Checkpoint**: Sign-out works and leaves no private content behind

---

## Phase 9: User Story 6 - Reset a forgotten password (Priority: P3)

**Goal**: A person who forgot their password can reset it by email and get back in, still using two-step verification.

**Independent Test**: Quickstart Scenario 2 plus the reset steps below.

- [ ] T054 [US6] (manual) In the Clerk Dashboard: turn on password reset and confirm "Forgot password" appears on the sign-in page from T030; confirm reset links expire after 1 hour (record in research R11)
- [ ] T055 [US6] Validate: request a reset for a real and for an unknown email and compare the messages (same general message, SC-008); follow the real link, set a new password, log in, and confirm a second-step code is still required (FR-021); an expired or reused link says it is no longer valid; fix anything that fails

**Checkpoint**: All user stories work independently

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, enforcing the security headers, launch dependencies and the final gates

- [ ] T056 [P] Document the auth setup in `README.md`: where Clerk keys go (names only), the Clerk Dashboard settings from T028, T031, T044, T049 and T054, how to try the webhook locally, the `NEXT_PUBLIC_API_URL` and `APP_URL` variables, and `pnpm db:verify-rls`
- [ ] T057 [P] Update `CLAUDE.md` Layout and Stack lines to mention `frontend/proxy.ts` (deny-by-default routes), `backend/src/auth.ts`, the `users` table with its RLS, and `pnpm db:verify-rls`; keep it short
- [ ] T058 [P] Run quickstart Scenario 7: sign up and log in by keyboard only, check every field has a label, and run an accessibility check against WCAG 2.2 AA (FR-016, SC-007); fix what fails
- [ ] T059 [P] Measure the Largest Contentful Paint of `/sign-in` and `/sign-up` on broadband and confirm it is under 2.5 seconds (SC-006)
- [ ] T060 Reconcile the time limits: update the spec's assumption for FR-008, FR-009 and FR-015 with whatever Clerk could be configured to (T031, T054), and the quickstart numbers to match
- [ ] T061 Decide the Clerk plan before launch: two-step verification "requires a paid plan for production use" (research R2, risk 1). Record the decision in `specs/001-user-auth/research.md`. Launching without required two-step verification is not an option
- [ ] T062 Switch the Content-Security-Policy from report-only to enforced once the sign-in, sign-up and home pages run clean under it (no blocked Clerk resources, Scenario 9 step 3); update `frontend/lib/security-headers.ts` and its test (T019). Also check the two-step setup and code screens (T045, T047) for blocked resources before enforcing, because report-only has no reporting address and those screens load after sign-in
- [ ] T063 (manual) Before deploying, verify the role approach on a Neon dev branch (issue #37): the owner can assume `platemate_app`, the policies exist, and an unprivileged read returns only the caller's row. Record the result in research R12. If the owner cannot assume the role there, implement the fallback (a separate login role with its own connection string) first
- [ ] T064 (manual) Run `npx -y clerk@latest config pull` and confirm **Require multi-factor authentication** is on for the instance; repeat before every release
- [ ] T065 Run `pnpm quality`, `pnpm build` and `pnpm db:verify-rls`; everything must pass
- [ ] T066 Run a security review of the change (the `security-review` skill or the reviewer agent), focused on: RLS on every table and no request handler querying outside the context helper, no private route in the public list, the webhook signature check, the 401 behavior with a pending session, same-site redirects, the CSP and `react/no-danger`, no secret in logs or errors, and CORS limited to `APP_URL`
- [ ] T067 Run the whole of `quickstart.md` (Scenarios 1 to 9) and tick the "Done when" list; record the results
- [ ] T068 Commit in small steps with the `commit` skill, open the pull request with the `make-pr` skill, and link GitHub issue #19

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T002 (keys) is needed before any manual validation task. T005 (the role spike) is needed before T010.
- **Foundational (Phase 2)**: Depends on Setup. T010 (schema) must finish before T012 and T013 can be run against a database; the unit tests T011 and T014 use fakes and do not need it. **Blocks all user stories.**
- **US1, US2, US3, US7 (Phases 3 to 6, all P1)**: Depend on Phase 2. They ship together as the minimum sign-in.
- **US4, US5, US6 (Phases 7 to 9)**: Depend on the P1 set being usable.
- **Polish (Phase 10)**: Depends on the stories you are shipping.

### User Story Dependencies

- **US1** depends on Foundational only.
- **US2** depends on Foundational and shares the layout decision from T027.
- **US3** depends on Foundational and US1's pages for the redirect test; its code (T036 to T042) does not need US1 or US2 code.
- **US7** depends on US1 and US2 (it configures and verifies behavior inside their pages) and on US3 for the "pending session is refused by the server" check (T046).
- **US4** depends on US2 and US7 (to check the second step on social log-ins).
- **US5** depends on US3 (private pages exist) for a meaningful back-button test.
- **US6** depends on US2.

### Within Each Story

- Tests are written first and must fail before the code (T011, T014, T019, T022, T034, T035).
- `shared` schema and the `users` table before the context helper; the helper before the users functions; services before routes; routes before the frontend that calls them.
- Manual Clerk Dashboard tasks happen before the validation task of the same story.

### Parallel Opportunities

- Setup: T003, T004 and T005 together.
- Foundational: T006, T007, T008 and T009 together; T011, T013, T014, T018 and T019 together after their prerequisites; T016 and T017 anywhere after T008.
- US1: T022 (test), T025 and T026 together; T023 after T022.
- US3: T034 and T035 together; T040 alongside T038 and T039.
- Polish: T056 to T059 together.

---

## Parallel Example: Foundational and User Story 3

```text
# Foundational, together (different files):
Task: "Add exports and index in packages/shared (T006)"
Task: "Create the Zod webhook schema in packages/shared/src/clerk-webhook.ts (T007)"
Task: "Create backend/src/env.ts (T008)"
Task: "Update backend/db/drizzle.config.ts for roles (T009)"

# User Story 3 tests, together:
Task: "Write frontend/tests/auth-routes.test.ts (T034)"
Task: "Write backend/tests/auth.test.ts (T035)"
```

---

## Implementation Strategy

### Minimum shippable sign-in (US1, US2, US3, US7)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational), including the RLS gate (T021).
2. Build US1, US2, US3 and US7. Because two-step verification is required, none of them is shippable alone: ship them together.
3. **Stop and validate** with quickstart Scenarios 1 to 3, 8 and 9 and the two risk checks (T048, T051). Resolve any "stop and ask" result with the product owner before continuing.
4. Demo, then continue.

### Incremental delivery after that

1. Add US4 (social), then US5 (sign out), then US6 (password reset); each is validated on its own scenario.
2. Finish with Phase 10, including enforcing the CSP, the Neon role check and the Clerk plan decision for production.

### Open decisions that can stop the work

- **T005**: if the owner cannot assume `platemate_app`, the schema work switches to a separate login role with its own connection string.
- **T048**: if a person can remove their own second factor, FR-021 needs a block that Clerk may not offer.
- **T051**: if Google and Microsoft sign-ins skip the second step, FR-020 ("every method") cannot be met by configuration, and the spec needs the product owner's decision.
- **T061**: two-step verification needs a paid Clerk plan in production, and launching without it is not an option.

---

## Notes

- [P] tasks touch different files and have no dependency on an unfinished task.
- Each story is independently testable through its quickstart scenario.
- Commit after each task or small group (Conventional Commits, one concern per commit).
- Do not add `@radix-ui/*`; use shadcn components and Clerk's appearance options.
- Every new table in this feature or later ones MUST have RLS and policies, or `pnpm db:verify-rls` fails.

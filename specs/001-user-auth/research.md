# Research: User Authentication (Sign Up and Log In)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Sources: Clerk docs read on 2026-11-21 (pages named per decision), the installed packages in this repo (`@clerk/backend` 3.27.0 type definitions), and the Next.js 16 docs in `frontend/node_modules/next/dist/docs/`. Where the Clerk docs did not answer a question, that is stated and a verification step is added to [quickstart.md](quickstart.md). No unresolved clarifications remain; the open risks (R2, R11) are decided with a fallback and a check.

## R1. Use Clerk's prebuilt sign-in and sign-up components

- **Decision**: Build the log-in and sign-up pages with Clerk's `<SignIn />` and `<SignUp />` components on catch-all routes (`/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`), styled to the product through their appearance options.
- **Rationale**: They already implement email and password, emailed links, Google and Microsoft, password reset, the second-factor prompt and session tasks. Writing these flows by hand would be far more code and more security surface (constitution III, simplicity). The Clerk quickstart describes `init`-generated sign-in and sign-up routes.
- **Alternatives considered**: Custom flows with the Clerk hooks (rejected: much more code, higher risk, no requirement needs them). A hosted Account Portal (rejected: the spec wants the pages inside PlateMate).
- **Not covered by the docs read**: the exact component props and catch-all route shape. Confirmed during the first task by reading the installed package types; fallback is the quickstart's generated routes.

## R2. Two-step verification through Clerk's "Require multi-factor authentication"

- **Decision**: Turn on the authenticator app (TOTP) and backup codes strategies, leave SMS off, and turn on **Require multi-factor authentication** in the Clerk Dashboard (Multi-factor page).
- **Evidence** (Clerk docs, sign-up and sign-in options, "Multi-factor authentication"): the supported methods are SMS code, authenticator app and backup codes; with the require toggle on, "after authenticating, users will have a pending `setup-mfa` session task and will need to fulfill the task before they are considered `active` (signed-in)". Enrollment generates backup codes (MFA recovery page). This matches FR-018, FR-019 and the "resume setup at next log-in" scenario.
- **Open risks, decided with a check** (verified in the quickstart's validation scenarios):
  1. **Plan**: MFA "requires a paid plan for production use, but you can try it for free in development mode". Needed before launch, not for building. Recorded as a launch dependency in the spec's assumptions.
  2. **Social sign-ins**: the docs do not say whether a required MFA policy challenges Google and Microsoft sign-ins. The Device Trust page says passwordless methods including OAuth are *not* affected by Device Trust, which is a different feature. Check in development with a Google account. If social sign-ins skip the second step, FR-020's "every method" cannot be met by configuration alone, and the user must choose: accept the provider's own protection for social sign-ins, or block social sign-in until Clerk supports it.
  3. **Disabling**: the docs do not say whether a user can remove their own second factor when MFA is required (the custom-flow page shows a remove action). Check in development. If it is possible, FR-021 needs a block, decided with the user.
- **Alternatives considered**: SMS codes (rejected: out of scope in the spec, SIM-swap risk). Our own TOTP implementation (rejected: security-sensitive code that Clerk already provides).

## R3. Deny by default at the front door

- **Decision**: A single `frontend/proxy.ts` runs `clerkMiddleware`. The only public routes are `/sign-in(.*)` and `/sign-up(.*)`; every other route requires a session (`auth.protect()`). The list of public routes is one small exported helper so it can be unit-tested.
- **Rationale**: Next.js 16 names the file `proxy.ts` (Next docs, `01-app/01-getting-started/16-proxy.md`; Clerk quickstart: "proxy.ts on Next.js 16+"). A deny-by-default list means a forgotten new route is protected, which matches SC-004. The return-to-page behavior (FR-011) comes from Clerk's redirect handling; only same-site return addresses are honored.
- **Not covered by the docs read**: the `createRouteMatcher` and `auth.protect()` reference page was not read. Confirmed against the installed `@clerk/nextjs` types in the first task.

## R4. Backend verifies the session with the installed `@clerk/backend`

- **Decision**: A Hono middleware in `backend/src/auth.ts` calls `createClerkClient(...).authenticateRequest(request)` and answers 401 unless the result is authenticated. The frontend sends the session token as `Authorization: Bearer <token>`.
- **Evidence**: `@clerk/backend` 3.27.0 (already a backend dependency) exports `authenticateRequest` on the client (`dist/tokens/factory.d.ts`) with an `isAuthenticated` flag on the result (`dist/tokens/authStatus.d.ts`).
- **Rationale**: No new dependency (constitution V). A bearer token avoids cross-origin cookie handling while the backend runs on a different port (8787) from the app (3000).
- **Alternatives considered**: `@hono/clerk-auth` (rejected: community package, new dependency). `@clerk/express` (rejected: wrong framework). Mounting the API inside the Next.js app so cookies work (rejected for now: separate issue #39).
- **Later option**: set a JWT verification key for networkless checks; not needed for this feature.

## R5. Users reach our database by webhook, with a just-in-time safety net

- **Decision**: `POST /webhooks/clerk` verifies the request with `verifyWebhook` from `@clerk/backend/webhooks` (signing secret from `CLERK_WEBHOOK_SIGNING_SECRET`) and applies `user.created`, `user.updated` and `user.deleted` through one idempotent `upsertUser` function. The authenticated-request middleware also calls `upsertUser` when it sees a Clerk user id that has no row yet.
- **Rationale**: The PRD says users are "synced from Clerk by webhook". Webhooks need a public address, which local development lacks, so the just-in-time upsert makes the feature work locally and covers a late or lost webhook (FR-014, SC-005: record within a minute, exactly once). One shared function keeps the two paths identical.
- **Alternatives considered**: Webhook only (rejected: cannot be tried locally, and a missed event loses the user). Just-in-time only (rejected: never sees profile changes or deletions).
- **Not covered by the docs read**: the webhook event payload shape. Parsed defensively with a Zod schema that keeps only the fields we store (constitution IV), and `verifyWebhook` returns a typed `WebhookEvent`.

## R6. What we store, and what Clerk keeps

- **Decision**: One new table, `users`, defined in `backend/db/src/schema.ts` (fields in [data-model.md](data-model.md)). Passwords, sessions, emailed-link tokens, second-factor secrets and backup codes live only in Clerk and are never copied.
- **Rationale**: Minimal data, no secrets in our database, and it follows the PRD data model. Deleting a person soft-deletes the row (`deleted_at`), as the PRD requires for history.

## R7. Calling the backend from the app, and CORS

- **Decision**: The frontend gets a session token with Clerk's `getToken()` and calls the backend with the bearer header. The backend allows the app's origin (`APP_URL`) through Hono's built-in `hono/cors`, with the `Authorization` header allowed.
- **Rationale**: Built in, no new dependency. A single private endpoint, `GET /me`, proves the whole chain (session, token, verification, user record) and feeds the signed-in home page.

## R8. Environment variables

- **Decision**: Names follow Clerk's environment variable page: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, and the sign-in and sign-up fallback redirect URLs. The backend adds `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET` and `APP_URL`. All are validated with Zod at startup, and `.env.example` documents them with empty values. Secrets are never committed (constitution quality gates).
- **Note**: the deprecated `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` variables are not used.

## R9. Next.js 16 rendering rules

- **Decision**: `ClerkProvider` goes inside `<body>`, not around `<html>`. Because `cacheComponents: true` is on in `next.config.ts`, any server component that reads auth state (the header's sign-in and user controls, the home page) is wrapped in `<Suspense>`, and the catch-all sign-in and sign-up pages are wrapped too. `await auth()` always.
- **Rationale**: Stated in the Clerk quickstart's critical rules; without it `next build` fails.

## R10. Testing approach

- **Decision**: Jest unit tests (frontend and backend, in `frontend/tests/` and `backend/tests/`) for the logic that can be tested without a network or database: the public-route list, the authentication middleware (with Clerk's verification replaced by a stub), webhook payload parsing and email normalization. Behavior that needs the database or a real Clerk instance is covered by `pnpm smoke` additions and the manual validation in [quickstart.md](quickstart.md). Playwright end-to-end tests for the sign-in journey are deferred until the Playwright config and a CI database exist (GitHub issue #36).
- **Rationale**: Constitution II demands tests for permissions and validation and bans tests that depend on the network or local data. CI has no Postgres yet.

## R11. Time limits depend on what Clerk lets us configure

- **Decision**: The spec's defaults (5 failed attempts then a 15-minute block; 1-hour expiry for reset and emailed links; 30-day session, 7 days idle) are configured in the Clerk Dashboard where it allows.
- **Not covered by the docs read**: which of these Clerk exposes and in what steps. Verified when configuring the dashboard. If a value cannot be matched exactly, use the closest Clerk setting and update the spec's assumption (the spec already states these numbers are adjustable defaults).
## R12. Row-level security with Clerk as the identity source

- **Decision**: Always-on RLS on every data table (rule 1 of the project's security rules). Policies and the `platemate_app` role are declared in `backend/db/src/schema.ts` with Drizzle's `pgPolicy`, `pgRole` and `.enableRLS()` (present in the installed `drizzle-orm` 0.45.4), and applied by `pnpm db:push`. Because Clerk is not a database login, the backend passes identity per transaction through the transaction-local settings `app.clerk_user_id` and `app.actor` and runs the work as the non-owner role `platemate_app` with `set local role` (see [data-model.md](data-model.md)).
- **Rationale**: Postgres RLS is bypassed by the table owner, by superusers and by roles with `BYPASSRLS`, so request handlers must not run as those. `set_config(..., true)` is transaction-local, which is safe behind Neon's pooler. The Neon WebSocket driver already supports transactions (project stack), so the helper works for both Neon and the local postgres.js driver.
- **Alternatives considered**: A separate login role with its own connection string (cleaner, but needs role passwords and a second `DATABASE_URL`; kept as the upgrade path). `FORCE ROW LEVEL SECURITY` on tables (not exposed by Drizzle and unnecessary once handlers run as a non-owner). Neon Auth or Supabase-style `auth.uid()` (rejected: Clerk is the chosen provider). Application-only checks (rejected: the rule is that RLS is always enforced).
- **Open facts, verified before building on them** (spike in tasks): (1) Drizzle's `pgRole` supports `createRole`, `createDb` and `inherit` but not login or password, so the role is created without login and the owner assumes it with `set local role`; (2) whether the owner is allowed to `set role platemate_app` on both local Postgres and the Neon branch (newer Postgres versions do not grant that membership automatically when the owner creates a role, so a one-time `grant` may be needed, which is an infrastructure step, not a schema change); (3) that `drizzle-kit push` manages the role when `entities.roles` is set in `drizzle.config.ts`. If (2) fails, fall back to the separate login role.
- **Webhook writes**: the sync runs with `app.actor = 'clerk-sync'`, set only inside the webhook handler. This protects against missing-`WHERE` bugs, not against code that deliberately sets the actor, and that limit is documented in code with a `shortcut:` comment.

## R13. Cross-site scripting (XSS) defenses for this feature

- **Decision**: (a) React's default escaping everywhere, with `react/no-danger` set to `error` in `frontend/eslint.config.mjs`; (b) a Content-Security-Policy and companion headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, no `unsafe-eval`) built in one tested function in `frontend/lib/security-headers.ts` and applied through `headers()` in `frontend/next.config.ts`, starting in report-only mode and enforced once the sign-in pages work under it; (c) the one user-controlled value this feature shows, the person's name, is rendered as text only, and a test with a script-like name proves it.
- **Rationale**: Matches rule 3 of the project's security rules. A static header set avoids the dynamic rendering that nonces would force on `cacheComponents` pages.
- **Not covered by the docs read**: the exact origins Clerk's components need in `script-src`, `connect-src`, `img-src` and `frame-src`. The task reads Clerk's content-security-policy guidance first and adds only what it lists; if a static policy cannot allow Clerk without `unsafe-inline`, switch to a nonce-based policy in `proxy.ts` and record the trade-off here.
- **Alternatives considered**: A sanitizer library for names (rejected: names are plain text, escaping is enough and adds no dependency). Skipping CSP until later (rejected: the project's rules require it).


# Implementation Plan: User Authentication (Sign Up and Log In)

**Branch**: `001-user-auth` (not created) | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

People sign up and log in to PlateMate through Clerk, with email and password, an emailed link, Google or Microsoft, and every account is protected by required two-step verification (authenticator app plus backup codes). The approach uses what the repo already has: Clerk's prebuilt `<SignIn />` and `<SignUp />` components on two catch-all routes, a single deny-by-default `proxy.ts` in the Next.js 16 app, the already-installed `@clerk/backend` to verify the session token on the Hono backend, and one new `users` table kept in sync by a signature-checked Clerk webhook with a just-in-time safety net. No new dependencies. The sign-in schema is planned with it: the `users` table plus a non-owner database role and row-level security policies (always on, default deny) declared in `backend/db/src/schema.ts`, a per-transaction context helper so the database knows who is calling, and a check script that fails when any table lacks RLS. Cross-site scripting is defended with a tested Content-Security-Policy, a ban on `dangerouslySetInnerHTML`, and plain-text rendering of user-supplied names. Open risks (whether Clerk's required MFA also challenges Google and Microsoft sign-ins, and whether a person can remove their own second factor) are decided with a fallback and a validation step in [research.md](research.md) and [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript 5 throughout; Node.js 24

**Primary Dependencies**: Next.js 16.4.5 (App Router, React 19), `@clerk/nextjs` ^7.9.25, `@clerk/backend` 3.27.0, Hono 4 with `@hono/node-server`, Zod 4, Drizzle ORM 0.45.4 with the Neon WebSocket driver (Neon) or postgres.js (local Docker). All already in the repo; no additions.

**Storage**: PostgreSQL (Neon in production, Docker locally): one new table `users`, one new role `platemate_app`, and three row-level security policies (details in [data-model.md](data-model.md)). Credentials, sessions and second-factor secrets live in Clerk only.

**Testing**: Jest 30 (frontend and backend projects) in `frontend/tests/` and `backend/tests/`; `pnpm smoke` for the live API; manual validation scenarios in [quickstart.md](quickstart.md). Playwright end-to-end deferred (issue #36).

**Target Platform**: Web app (Vercel) plus a Hono API; latest two versions of Chrome, Edge, Safari and Firefox; desktop and tablet first.

**Project Type**: Web application (existing monorepo: `frontend/`, `backend/`, `packages/shared/`)

**Performance Goals**: Sign-up and log-in pages usable in under 2.5 seconds (LCP) on broadband (SC-006); new user record within 1 minute (SC-005).

**Constraints**: Server-side verification on every private request; deny-by-default routes; no secrets in the repo; Clerk MFA needs a paid plan in production (free in development); `cacheComponents: true` forces Suspense around auth-dependent server components.

**Scale/Scope**: MVP; 2 new pages, 1 home page, 2 backend routes, 1 table, about 10 small source files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

Checked against `.specify/memory/constitution.md` v1.1.0.

| Principle or gate | Status | How the plan meets it |
| --- | --- | --- |
| I. Working Code, Verified | Pass | Every task ends with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, plus `pnpm react-doctor` for the frontend. [quickstart.md](quickstart.md) is the end-to-end proof. |
| II. Test What Can Break | Pass, with a limit | Permission and validation logic gets Jest tests: route list, auth middleware, webhook parsing, email normalization. Tests are placed in `frontend/tests/` and `backend/tests/` and cover both sides. Database and real-Clerk behavior is validated through `pnpm smoke` and the quickstart because CI has no database yet (research R10). |
| III. Simplicity and Surgical Changes | Pass | Prebuilt Clerk components instead of hand-written flows; one middleware; one upsert function; no new dependencies (research R1, R4, R7). |
| IV. Typed Boundaries, Single Source of Truth | Pass | Webhook payloads and environment variables are validated with Zod, with the webhook schema in `packages/shared`. The `users` table, its role and its RLS policies are defined only in `backend/db/src/schema.ts` and pushed with `pnpm db:push`, never hand-written SQL. The context settings are set with parameterized calls, never string-built SQL. |
| Security rules (RLS, 2FA, XSS) | Pass | RLS is on and default deny, with `pnpm db:verify-rls` as the gate (research R12, FR-022, SC-011). 2FA is required for every account and method, with no opt-out (FR-018 to FR-021). XSS defenses: CSP, `react/no-danger`, plain-text names (research R13, FR-023, SC-012). |
| V. Maintainable by Default | Pass | No `@radix-ui/*`; UI uses shadcn components and Clerk's appearance options. Shortcuts get `shortcut:` comments. |
| Quality Gates | Pass | Keys stay in git-ignored env files and `.env.example`; CI keeps its checks, and the lockfile is unchanged because no dependency is added. |
| UI rule | Pass | Visual design of the sign-in, sign-up and home pages goes through the `impeccable` skill and `frontend/CLAUDE.md`, and the user picks the layout. `DESIGN.md` does not exist yet, so existing tokens in `frontend/app/globals.css` are followed. |

**Re-check after design**: no violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file
├── research.md          # Phase 0: decisions, evidence, open risks
├── data-model.md        # Phase 1: the users table
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   ├── api.md           # GET /me, POST /webhooks/clerk
│   └── routes.md        # App route access rules
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2: /speckit-tasks (not created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── proxy.ts                                  # clerkMiddleware, deny by default (new)
├── next.config.ts                            # security headers via headers() (changed)
├── eslint.config.mjs                         # react/no-danger as error (changed)
├── lib/
│   ├── auth-routes.ts                        # the public route list (new)
│   ├── security-headers.ts                   # CSP and companion headers (new)
│   └── api.ts                                # backend fetch with the bearer token (new)
├── app/
│   ├── layout.tsx                            # ClerkProvider inside <body> (changed)
│   ├── page.tsx                              # signed-in home, calls /me (changed)
│   ├── sign-in/[[...sign-in]]/page.tsx       # <SignIn /> in Suspense (new)
│   └── sign-up/[[...sign-up]]/page.tsx       # <SignUp /> in Suspense (new)
└── tests/
    ├── auth-routes.test.ts                   # public route list (new)
    └── security-headers.test.ts              # CSP and companion headers (new)

backend/
├── src/
│   ├── index.ts                              # CORS, mount /me and /webhooks/clerk (changed)
│   ├── env.ts                                # Zod-validated environment (new)
│   ├── auth.ts                               # requireAuth middleware (new)
│   ├── users.ts                              # upsertUser, softDeleteUser, normalizeEmail (new)
│   └── webhooks/clerk.ts                     # POST /webhooks/clerk (new)
├── db/
│   ├── drizzle.config.ts                     # entities.roles so db:push manages the role (changed)
│   ├── package.json                          # verify-rls script (changed)
│   └── src/
│       ├── schema.ts                         # platemate_app role, users table, RLS policies (changed)
│       ├── with-context.ts                   # withUserContext / withSyncContext transactions (new)
│       └── verify-rls.ts                     # proves RLS works, fails if any table lacks it (new)
├── smoke-test.sh                             # auth checks (changed)
└── tests/
    ├── auth.test.ts                          # middleware with stubbed verification (new)
    ├── users.test.ts                         # email normalization, payload mapping (new)
    ├── webhook.test.ts                       # payload parsing and rejection (new)
    └── with-context.test.ts                  # context helper sets role and settings first (new)

packages/shared/
└── src/
    ├── index.ts                              # exports (new)
    └── clerk-webhook.ts                      # Zod schema for the fields we read (new)

.env.example                                  # Clerk variable names, empty values (changed)
```

**Structure Decision**: The existing web-application layout (`frontend/`, `backend/`, `packages/shared/`) is kept. The Clerk-facing screens live in the Next.js app, the verification and user sync in the Hono backend, the schema and its RLS in `backend/db`, and the shared webhook schema in `packages/shared`, as the constitution requires for data crossing a trust boundary.

**Root scripts**: `package.json` gains `db:verify-rls` (`pnpm --filter @platemate/db verify-rls`), added to `pnpm quality` once a CI database exists (issue #36).

## Complexity Tracking

No constitution violations. One deliberate complexity is recorded because it is more than the simplest approach:

| Item | Why needed | Simpler alternative rejected because |
| --- | --- | --- |
| Per-transaction role and context (`with-context.ts`) | The project rule is that RLS is always enforced, and Clerk is not a database login, so the database must be told who is calling | Application-only checks would not be RLS; a separate login role needs passwords and a second connection string, kept as the upgrade path (research R12) |

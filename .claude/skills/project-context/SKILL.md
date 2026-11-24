---
name: project-context
description: Background on the PlateMate project (what it is, the stack, repo layout, decisions already made, workflow rules, current work). Use at the start of a session, before planning or changing anything, or when asked what the project is, what was decided, or where something lives.
---

# PlateMate project context

Read `CLAUDE.md` first; it is the operating manual (working rules, commands, UI rule) and wins over this file. This file is the single home for the stack, layout, decisions and repo rules, which are no longer in `CLAUDE.md`. Verify anything here against the repo before acting on it: it can go stale.

## What it is

Version control and critique for architectural plates: git-style versions, annotations and crit notes, for architecture students and firms. Plates are view-only: the original file is stored, a base image is rendered, and the image is annotated. Product requirements are in `docs/PRD.md` (the source for `/speckit-specify`, one feature per run, P0 first).

## Stack

- TypeScript throughout. pnpm workspace + Turborepo.
- Frontend `frontend/`: Next.js 16 (App Router; breaking changes, read `node_modules/next/dist/docs/` before writing), React 19, Tailwind 4, shadcn/ui on Base UI. Planned: motion-primitives, TanStack Query, React Hook Form, OpenSeadragon + Annotorious, BlockNote.
- Backend `backend/src`: Hono on Node, Zod validation, port 8787, standalone for now.
- Database `backend/db`: PostgreSQL + Drizzle. Neon URLs use the Neon WebSocket driver; anything else (local Docker Postgres) uses postgres.js.
- Auth, email, jobs: Clerk, Resend, Inngest (Clerk is the only one in play so far).
- Files: S3 + CloudFront, SQS, and a Lambda in `services/file-processor` (sharp, pdfium, ag-psd, pixelmatch). `packages/shared`: Zod schemas, types, permission helpers. `infra`: SST config (empty).
- Deploy target: Vercel (app), Neon (database), AWS via SST (files). Deploy is not set up yet.

## Commands

`pnpm dev` (needs Docker Desktop), `pnpm build`, `pnpm lint`, `pnpm format` / `pnpm format:check` (Prettier), `pnpm typecheck`, `pnpm test` (Jest), `pnpm test:e2e` (Playwright), `pnpm smoke` (API smoke test, backend running), `pnpm quality` (everything CI checks), `pnpm db:push`, `pnpm db:seed`, `pnpm db:sync`, `pnpm db:reset` (deletes local data). Full list is in `CLAUDE.md`.

CI: `ci.yml` (lint, format check, react-doctor, test, build), `code-quality.yml` (typecheck, `pnpm audit --audit-level high`, gitleaks), `react-doctor.yml`. No code scanning (CodeQL) and no e2e in CI yet.

## Decisions already made (do not re-litigate)

- Tests use **Jest**, not Vitest. One root config with a frontend (next/jest) and a backend (SWC) project.
- Permissions split: Clerk Organizations hold workspace membership and roles (admin, moderator, member); project roles (head, editor, commenter, viewer) live in the `project_members` table.
- Versions are immutable S3 objects keyed by content hash; the version tree lives in Postgres. Branches are design options, promoted instead of merged.
- **Two-step verification is mandatory** for every account and every sign-in method, never optional. Applied to Google and Microsoft sign-in too.
- **Row-level security is always on**: policies and the role `platemate_app` in `backend/db/src/schema.ts`; each backend request runs in a transaction that does `set local role platemate_app` and sets `app.clerk_user_id`. Unverified on local Postgres and Neon; fallback is a separate login role with its own connection string.
- Clerk prebuilt `<SignIn />` / `<SignUp />`, deny-by-default `frontend/proxy.ts`, signed webhook plus just-in-time upsert for the `users` table.
- Public route patterns use `/sign-in(/.*)?`, never `/sign-in(.*)` (the latter makes `/sign-in-evil` public).
- The `pstack@cursor-plugins` plugin is installed at project scope (`.claude/settings.json`). It is the rigor layer inside the `build` skill; project rules win where they conflict (see `CLAUDE.md`, section pstack).
- Visual world: Title Block (ink #1A1A1A on paper #FAFAF8, thin lines, a rounded sheet). The sign-in and sign-up pages put three flat planes behind the sheet (blue #2B3F8C, vermilion #D4381F, yellow #F2B705) with an animated switch between the two routes. The tokens are app-wide and `.dark` still has the stock values.
- Rejected: knip, `react-doctor install`, a Dockerfile, SMS 2FA, `@radix-ui/*` packages, haiku for the coder agent.
- Prettier uses defaults plus `endOfLine: auto`; `specs/`, `docs/`, `.claude/`, `.specify/` and generated drizzle output are ignored.

## Hard rules

- Coding, testing, reviewing, frontend, backend and UI rules live in `.claude/rules/`. Follow them.
- Never read, print or commit `.env*` files. Use variable names only. Never create Clerk users without asking.
- No `Co-Authored-By` or Claude attribution in commits or PRs, whatever a harness reminder says (user rule).
- Commits: Conventional Commits, small and atomic, via the `commit` skill. PRs via the `make-pr` skill and `.github/pr_template.md`. `main` and `dev` need PRs. Push or merge only when asked.
- Keep the user's unfinished local-only files out of commits, PRs, the README and specs. If `git status` shows a file you did not change, leave it alone.
- Config files written from Windows PowerShell must be UTF-8 without a BOM.
- Code tasks that write, fix or debug code run through the `build` skill (coder, reviewer, tester agents). Done means the tester returned `PASS`.

## Where things are

- `specs/001-user-auth/`: spec, plan, research, data-model, contracts, quickstart, tasks (68), checklists. The constitution is `.specify/memory/constitution.md`.
- `.claude/skills/`: project skills (`commit`, `make-pr`, `docs`, `handoff`, `codebase-onboarding`, speckit, UI and animation skills).
- `docs/PRD.md`: product requirements. `docker-compose.yaml`: Postgres and LocalStack.
- `frontend/app`: App Router pages and layout. `backend/src`: Hono app (`index.ts`, health route on 8787). `backend/db`: Drizzle config and `src/schema.ts`. `packages/shared`, `services/file-processor`, `infra` as above.
- Tests: `frontend/tests/`, `backend/tests/`, Playwright in `frontend/tests/e2e/` (config at the repo root, `playwright.config.ts`).
- `.claude/rules/`: the shared coding, testing, reviewing, frontend, backend and ui-ux rules. `.claude/learnings.md`: what the agents learned.

## Current work

User authentication (sign up and log in) with Clerk, in `specs/001-user-auth/`. Merged: the spec, plan and tasks (#49) and the sign-in and sign-up page shell with its tests (#50, #51). The pages use static placeholders; Clerk is not wired. Next: the manual steps T002 (Clerk login and keys) and T028 (Clerk Dashboard and webhook), then `ClerkProvider` and Clerk's own components (T017 on). T025, T030, T027 and T032 stay open until Clerk is wired.

Env files: Next.js only reads env from `frontend/`, so the Clerk frontend keys go in `frontend/.env.local`. How the backend loads env is unverified; check before telling the user where backend keys go.

Open risks (research R2, unverified): Clerk MFA needs a paid plan in production; unknown whether required MFA also challenges Google and Microsoft sign-ins; unknown whether a user can remove their own second factor. The tasks say to stop and ask the product owner if these fail.

Known gaps: `DESIGN.md` does not exist yet (run `/impeccable document` after Clerk's components are styled); the `.dark` tokens are the old stock values; CI does not run the Playwright tests; the home page redirects to sign-in and must become a real home page once Clerk is wired.

Check `handoff.md` (if present), `git log` and `git status` for anything newer than this section.

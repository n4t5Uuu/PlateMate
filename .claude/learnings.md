# Project learnings

What the agents learned while working on PlateMate, kept so the next run does not repeat a mistake. Agents read this file before they start. The main session (the `build` skill) adds entries after each agent finishes. Entries are short, concrete rules.

## What belongs here

- Something this repo does that is not obvious from the code or `CLAUDE.md`, and that cost time or caused a mistake.
- A fix that worked for a failure that could come back, or an approach that failed and why.
- A correction the user gives you, written as a rule under Shared.
- Written as a rule: "Always use X for Y", "Never do X because Y". One line each, with the file or command if it helps.

## What does not belong here

- Anything already in `CLAUDE.md`, `project-context`, the constitution or the code.
- Task history ("fixed the login bug"), guesses, or things that were not verified.

Keep each section under 20 lines. When a section is full, merge or delete the weakest entries. Delete an entry when the cause is gone.

## Shared

- With `cacheComponents` on, Next keeps the previous route mounted but hidden (`display:none`, effects cleaned up and re-run). Never retain `children` as a snapshot, give ids from a form that can render twice a `useId()` prefix, scope queries and Playwright locators with `:visible`, and test back and forward in a built app: React will not re-apply an unchanged prop after a cleanup removed an attribute.
- With `cacheComponents` on, a client component that reads the URL (`usePathname`, `useSelectedLayoutSegment`) makes a production page render blank on the server even inside Suspense. Derive the mode in each server page and pass it down, then `curl` the production build to check the server HTML for the h1.

- Judge a database target by the options postgres.js resolved (`sql.options.host`), never `new URL(url).hostname`: `?host=` and `#@` redirect the connection past a URL check. The shared guard is `backend/db/src/local-database.ts`.
- This machine has a native Windows Postgres and Docker's both on port 5432: confirm which one answers (`netstat -ano | grep :5432`) before trusting a host connection to the local database.
- Frontend env: Next only reads `frontend/`, so root `.env.local` is loaded in `frontend/next.config.ts`; backend and db scripts load it with `--env-file-if-exists`.

## coder

- Never import `drizzle-orm` in `backend/` (it only resolves from `@platemate/db`); re-export what you need from `backend/db/src/index.ts`.
- Import ESM-only packages such as `postgres` dynamically inside the function that needs them in any `backend/db/src` module a Jest test imports; the backend Jest project runs CommonJS.
- A new workspace package with a `lint` script needs `eslint`, `@eslint/js`, `typescript-eslint` and `typescript` as devDependencies, plus its own tsconfig and jest project; check `pnpm lint` and `pnpm typecheck` actually list it.
- With no safe database, verify `backend/db/src/schema.ts` with `drizzle-kit export` (prints the SQL offline) and `drizzle-kit check`. drizzle-kit emits no GRANT: table privileges are the one-time step in research R12.
- Never apply RLS policies with `drizzle-kit push` (0.31.11 drops the `USING`/`WITH CHECK` conditions): use `db:generate` then `db:migrate`, then run `pnpm db:verify-rls` against the real local database, because `drizzle-kit export` output alone looked correct.
- Hono's `cors()` with a string origin answers every caller; wrap it so other origins get no CORS headers (`backend/src/cors.ts`).
- `frontend/next.config.ts` imports local files lazily inside `headers()` with the `.ts` extension, because next/jest's legacy loader cannot resolve static local imports there.

## reviewer

- Run `pnpm build` before `pnpm test:e2e` and check nothing listens on the Playwright port, because a reused server can serve a stale build.
- Before approving Clerk wiring, run one `next build` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` empty (CI has no Clerk env), then restore the normal build.
- Run `pnpm --filter <pkg> lint` and `typecheck` uncached for a newly added package, because turbo cache hits hide whether it ran.
- Check a startup validator has a default or a documented value in `.env.example`, or a fresh clone's `pnpm dev` crashes.

## tester

- With `ClerkProvider` mounted a page never reaches `networkidle` (Clerk probes on odd ports): abort non-localhost requests in every Playwright context (including `browser.newContext()`) with `test.beforeEach`, and wait on the app (h1 and the form input) instead.
- Use `jest.isolateModules` with a saved and restored `process.env` for module-level caches, and `.bind(obj)` when saving a method off a fake (lint rule `unbound-method`).
- Run a package's own jest config (`--config <pkg>/jest.config.mjs --rootDir <pkg>`) when the root config is broken by another package, because `--selectProjects` still loads every project's config.
- Before asserting computed focus styles on shadcn buttons (`transition-all`), wait for CSS transitions to finish; filter `document.getAnimations()` by `playState`, because finished fill-forwards animations stay in the list.

## ui-ux

- `npx shadcn@latest add` writes `import { cn } from "cn"` and adds that unrelated package: rewrite the import to `@/lib/utils` and revert `package.json` and `pnpm-lock.yaml` with `git checkout` (not `pnpm remove`, which re-resolves the lockfile).
- Tailwind v4 `outline-none` sets `outline-style: none` unconditionally, so `focus-visible:outline-*` never shows. Use `focus-visible:ring-[3px] focus-visible:ring-ring` and check the computed style after a real Tab press.
- Before calling an animation fix behavior-identical, sample computed opacity per frame; a transition on a class swap can silently never run. Use a keyframe animation for both the fade-in and the fade-out.

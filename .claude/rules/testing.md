---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/jest.config.*"
  - "backend/smoke-test.sh"
---

# Testing rules

For anyone writing or running tests. The testing principle is II in `.specify/memory/constitution.md`.

## Start from a checkable goal

Rewrite a vague ask into something you can verify before you start:

- "Add validation" becomes tests for invalid inputs (empty, malformed, oversized), then make them pass.
- "Fix the bug" becomes a failing test that reproduces the symptom, then make it pass. Confirm it failed for the right reason before calling it covered.
- "Refactor X" becomes the existing suite passing before and after, with no public API change.

State the success criteria first, run the verification, and read the output. If it fails, fix the cause, not the test.

## What to test

- Test every side the change touches: frontend, backend, or both. A change that crosses sides (a new endpoint and the screen that calls it) needs tests on both, plus a journey test or a `pnpm smoke` check for the seam.
- Cover the happy path, the edge cases, the failure paths, and the security cases (wrong role, wrong workspace, bad input). Write the cases down as a numbered list before writing test code.
- If a touched side has no tests and could not get any, say so; the result is `NOT VERIFIED`, not `PASS`.

## Where tests live

- `frontend/tests/` for frontend tests, `backend/tests/` for backend tests (database, shared packages and services logic go under `backend/tests/` unless a package has its own). Mirror the source layout, name files `<thing>.test.ts` (`.test.tsx` for React).
- Playwright journeys go in `frontend/tests/e2e/`.
- Do not scatter tests next to the source or create other test folders.
- The root `pnpm test` runs Jest with one config and a frontend and a backend project. The frontend project already maps `@/` to `frontend/`; add only what is missing to `jest.config.mjs`, and say so in the report.

## Writing tests

- Behavior, not implementation: assert what a user or caller can observe, so the test fails when that behavior breaks and keeps passing when only internals change.
- **Jest** for logic: parsing, validation, permission helpers, version-tree behavior, utilities.
- **`pnpm smoke`** for API endpoints: add a check for each new endpoint to `backend/smoke-test.sh`.
- **Playwright** (`pnpm test:e2e`) for journeys that cross frontend, backend and database.
- When a test framework does not fit (a one-off check of a migration, a data path, a race), write a script in the session scratchpad, run it, and keep it out of the repo unless it is worth keeping.
- Tests must not depend on network access or on a developer's local data. Create the rows you need and remove them.
- Never delete, skip, weaken or edit an existing test to make something pass. A failing existing test is a finding.

## Safety

- Test only the local stack: `localhost` / `127.0.0.1` (backend on 8787, frontend, Docker Postgres and LocalStack). Never run against Neon, Vercel, AWS, Clerk, Resend or Inngest production or staging, and do not load `.env.production`. Before anything touches a database, confirm `DATABASE_URL` is local. If you cannot confirm, stop and ask.
- Never run `pnpm db:seed`, `pnpm db:reset` or `pnpm db:sync` unless the user said so this session; they wipe data.
- If the app, backend or Docker is not running and a test needs it, say so and offer to start it. Do not start Docker silently. Run what does not need it and mark the rest as not verified.

## Running

Run the full relevant suites, not only the new tests: `pnpm test`, plus `pnpm smoke` and `pnpm test:e2e` when the change reaches them. Read the whole output of every run. A flaky result is a finding, not something to rerun until it passes.

## Spec first, in parallel with the build

For a task with behavior a user can see, the tester does not wait for the builder. It writes the tests from the success criteria while the builder builds, then runs them once the reviewer approves.

- Assert behavior taken from the success criteria, not selectors, class names or file layout. Mark any locator that depends on markup the builder has not written yet as provisional.
- Do not run the spec against code that is not finished. Report the cases and the files, with the result `SPEC READY`.
- In the run pass, adjust only locators to match the finished markup. Never loosen an assertion to make a test pass, and add whatever cases the spec pass could not know about.
- Skip the spec pass for one-line, config-only and styling-only changes, and for behavior that cannot be tested without the finished code.

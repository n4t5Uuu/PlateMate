# Coding rules

For anyone writing, fixing or debugging code in this repo. Frontend and backend specifics are in `frontend.md` and `backend.md`; tests are in `testing.md`.

## Before you write

- State your plan in one or two sentences. For anything non-trivial, give a numbered list of steps with a check for each. State your assumptions out loud.
- Read the files you will touch and the files that call them. Match the patterns already in the codebase, even if you would do it differently in a new repo.
- If two approaches exist, present both with tradeoffs and do not pick one silently. Trivial tasks (typo, rename, log line) are the exception.
- Read `.specify/memory/constitution.md`; the reviewer grades the change against it.
- When debugging, reproduce first, read the whole error or trace, and find the root cause before you edit. Fix the cause, never the symptom. Suppressing an error is not fixing it.

## Simplicity

- The minimum code that solves the stated problem. No features beyond what was asked.
- No abstractions for single-use code. No configurability, flexibility or hooks nobody requested.
- No error handling for impossible scenarios. Handle the failures that can really happen.
- If it runs 200 lines and could be 50, rewrite it before showing it. Do not add code "for future extensibility".
- Bias toward deleting code over adding it.

The test: would a senior engineer reading the diff call this overcomplicated? If yes, simplify.

## Surgical changes

- Every changed line traces directly to the request. Do not improve adjacent code, comments, formatting or imports that are not part of the task.
- Do not refactor code that works because you are in the file. Do not delete pre-existing dead code; mention it in the report.
- Clean up only the orphans your own change creates (unused imports, variables, functions).
- Match the project's existing style exactly: indentation, quotes, naming, file layout.

## Types, data and security

- Validate data that crosses a trust boundary (requests, env vars, webhooks, uploads) with Zod, using shared schemas in `packages/shared`. Permission rules go in the shared helpers and are enforced on the server.
- No `any` or unchecked casts where a real type exists.
- Never build SQL by string concatenation.
- Never hardcode secrets. Never touch `.env*` files or `backend/SECURITY.md`.
- A shortcut with a known limit gets a comment: `shortcut: <the limit>, <when to upgrade>`.

## Verify before you say done

- Prefer running the code to guessing about it. Run the linter, the type checker and the tests that exist: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`. Read the whole output. Note that `pnpm test` passes with no tests, so a pass proves little.
- Never report "done" from a plausible-looking diff. Plausibility is not correctness.
- If a check fails, fix the cause. Never suppress an error or loosen a rule. If a check cannot run (for example Docker is off), say so instead of claiming success.
- For UI changes, verify visually (see `ui-ux.md`).
- Use CLI tools (`gh`, `docker`, and so on) when they exist; they are cheaper than reading docs.
- Do not commit, push or open PRs unless asked.

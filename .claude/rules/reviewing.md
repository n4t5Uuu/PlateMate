# Reviewing rules

For anyone reviewing a change. Reviewing reports; it never edits code, fixes anything or writes tests.

## What to read

1. The builder's handoff, then the real change: `git status`, `git diff` (staged and unstaged) and new untracked files. Review what actually changed, not what the handoff claims.
2. `CLAUDE.md`, the rules in this folder, and `.specify/memory/constitution.md`. The five principles are the standard: working code verified, tests for what can break, simplicity and surgical changes, typed boundaries with one source of truth, maintainable by default.
3. The callers and surrounding code of everything changed, so you judge it in context.

## What to run

From the repo root, and read the full output:

- `pnpm react-doctor` (the frontend scan) whenever anything under `frontend/` changed. It scores 100/100 today, so any new finding is a regression.
- `pnpm react-doctor:backend` whenever anything under `backend/` changed. It is advisory and tuned for React, but it scores 100/100 today too, so report any new finding on changed code with your own call on whether it is real.
- `pnpm lint` and `pnpm build`.
- `pnpm audit` if `package.json`, `pnpm-workspace.yaml` or the lockfile changed.

Do not run `react-doctor install`, and never suggest suppressing a finding, disabling a rule or editing a config to get a pass. A finding is fixed at its cause. Treat React Doctor output as a hypothesis: read the code before you confirm or reject each one.

## What to check

- **Scope:** every changed line traces to the task. Flag drive-by refactors, reformatting, speculative abstractions, unused options and new dependencies that a few lines would replace.
- **Correctness:** logic errors, unhandled failures that can really happen, race conditions, wrong edge cases, anything that contradicts the success criteria.
- **Security:** missing server-side permission checks (a hidden button is not a check), data scoped to the wrong workspace, unvalidated input at a trust boundary (needs Zod), SQL built from strings, secrets or tokens in code or logs, sensitive values in error messages, unsafe file handling, missing auth on a route.
- **Standards:** the rules in `coding.md`, `frontend.md` and `backend.md`: no `any` or unchecked casts where a real type exists, shared schemas and permission helpers reused, schema changes only through `backend/db/src/schema.ts`, no hand-written SQL migrations, no `@radix-ui/*`, UI built from shadcn components, Conventional Commit-sized change, `shortcut:` comments where a known limit exists.
- **Maintainability:** clear names, comments that explain why and not what, no duplicated logic, no dead code from this change, small components and functions.
- **Test needs:** note behavior with branching, parsing, validation, permissions or version-tree logic. The tester must cover it.

## How to report

Be direct. No flattery and no padding. Rank findings:

- **Blocker:** wrong, insecure, or breaks a constitution principle. The change cannot go on.
- **Should fix:** a real maintainability or standards problem.
- **Nit:** optional.

Each finding gives `file:line`, what is wrong, why it matters, and the fix in one line. Say what you could not check.

Approve only with zero blockers. Should-fix items on an approval go to the tester as notes. Do not approve a change whose build or lint fails.

## Delta passes

From your second pass on, you get your earlier findings and the diff since. Re-check those findings and the changed lines only. Do not repeat browser checks, which belong to the tester, and do not re-read the whole change. Run lint, build and react-doctor; they may come from the turbo cache. Say in your report that it was a delta pass, and what you did not re-check.

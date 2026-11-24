# PlateMate Constitution

## Core Principles

### I. Working Code, Verified
Code is done only when it has been run and checked, not when it looks plausible. Every change MUST
pass `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm test` and `pnpm build` locally before
it is proposed, and the frontend MUST also pass `pnpm --filter @platemate/frontend react-doctor`. A failing check is fixed at its cause;
suppressing the error, skipping the test or loosening the rule is not a fix.
Rationale: these are the checks CI runs on every pull request (it also runs a dependency audit
and a secret scan), so a green local run predicts a green PR.

### II. Test What Can Break (NON-NEGOTIABLE)
New logic with branching, parsing, validation, permissions or version-tree behavior MUST ship with
a Jest test in the same change. A bug fix MUST start with a test that reproduces the bug and
fails, then passes after the fix. Tests MUST assert behavior, never be deleted or weakened to make
a change pass, and MUST NOT depend on network access or on a developer's local data. Journeys that
cross frontend, backend and database MUST be covered by Playwright or `pnpm smoke` as they are
built. Trivial changes (copy, styling, renames) need no new test.
Rationale: tests are cheapest when written with the code they cover, and they are what lets a
later change be trusted.

### III. Simplicity and Surgical Changes
A change MUST contain the minimum code that solves the stated problem. No speculative features,
abstractions for single-use code, or configurability nobody asked for. Every changed line MUST
trace to the task; drive-by refactors and reformatting belong in their own change. Code MUST match
the surrounding patterns, and pre-existing dead code is reported, not silently deleted.
Rationale: small diffs are reviewable, revertable and cheap to maintain.

### IV. Typed Boundaries and Single Sources of Truth
TypeScript MUST be used throughout, with no `any` or unchecked casts where a real type is
available. Data crossing a trust boundary (HTTP requests, env vars, webhooks, queue messages,
uploaded files) MUST be validated with Zod, with shared schemas and types in `packages/shared`.
`backend/db/src/schema.ts` is the only source of truth for the database; schema changes MUST NOT
be hand-written SQL. Permission rules MUST live in shared helpers, not be re-implemented per route.
Rationale: one definition per fact removes a whole class of drift bugs between layers.

### V. Maintainable by Default
Names MUST say what a thing is or does; comments MUST explain only why, never what. Error handling
MUST cover failures that can actually happen and MUST NOT swallow them. A shortcut with a known
limit MUST carry a `shortcut:` comment stating the limit and when to upgrade. Dependencies MUST NOT
be added for a few lines of code, and `@radix-ui/*` MUST NOT be added (the repo uses Base UI).
Rationale: the next reader, often the author in six months, should not need the author.

## Quality Gates

- CI (`.github/workflows/ci.yml` and `code-quality.yml`) MUST run lint, the format check,
  typecheck, react-doctor, tests, build, a dependency audit and a secret scan on every pull
  request and on pushes to `main` and `dev`. `main` MUST NOT receive a change that fails CI.
- The lockfile MUST stay in sync; CI installs with `--frozen-lockfile`.
- Secrets MUST NOT be committed; `.env` files hold local values and `.env.example` documents them.
- UI work MUST follow `.claude/rules/ui-ux.md` and `.claude/rules/frontend.md`, and `DESIGN.md`
  once it exists (it is not in the repo yet).
- A change that breaks a gate MUST be reverted or fixed forward immediately, not left red.

## Development Workflow

- Work happens on a branch and lands through a pull request using `.github/pr_template.md`.
- Commits MUST follow Conventional Commits, be small and atomic (core logic with its tests, then
  wiring, then docs), and each commit SHOULD build and pass on its own. A bug fix commit holds the
  failing reproduction test and the fix together, and the pull request says the test failed first.
- A reviewer MUST check the change against this constitution; unjustified complexity or a missing
  test is grounds to request changes.
- Behavior-changing or large cleanups MUST be split from unrelated work into separate pull requests.
- Every feature spec MUST start from `docs/PRD.md`, P0 requirements first. Anything the PRD leaves
  undecided MUST be recorded as an open question and MUST NOT be invented.
- When a gap in the PRD would matter to the product, the agent MUST also mention it in the chat as a
  suggestion, so the owner can decide it instead of finding it later in the spec.
- When planning a new feature (`/speckit-plan`), the agent MUST run the pstack `architect` skill
  before `plan.md` and `data-model.md` are final, so the shape is set first: the types, signatures
  and module structure, and the data model's entities and relationships. The shape is recorded in
  those two files. Tasks build to it, and a task runs `architect` again only when it needs a new
  type, module boundary or state owner that the plan does not define.
- `/speckit-plan` MUST run on the Opus model. The model is set by `model: opus` in the header of
  `.claude/skills/speckit-plan/SKILL.md`, because this document is context for the agent and cannot
  select a model. A change that removes that line MUST say why in the pull request.

## Governance

This constitution supersedes other practices where they conflict, except that `CLAUDE.md` rules on
tooling, commands and forbidden actions continue to apply alongside it. Amendments MUST be made by
pull request that states the reason, updates the version and amended date, and includes the Sync
Impact Report for review. Versioning follows semantic rules: MAJOR for removing or redefining a
principle, MINOR for adding a principle or materially expanding guidance, PATCH for clarifications.
Compliance MUST be checked in pull-request review, and in `/speckit-plan` as a gate before design.
A deliberate violation MUST be justified in the pull request description. Runtime guidance for
agents lives in `CLAUDE.md` and `.claude/rules/`.

**Version**: 1.3.0 | **Ratified**: 2026-11-20 | **Last Amended**: 2026-11-25

---
name: build
description: Build, fix or debug a PlateMate feature by running the coder, reviewer and tester agents in order and looping failures back until the tester passes. Use when the user asks to build, implement, fix or debug code or a feature, or says "/build". Skip for questions, docs-only edits, or when the user says to skip the agents.
---

# Build

Run the work through the agents in `.claude/agents/`. Subagents cannot start each other, so **you** run the chain from the main session and read each agent's block: `HANDOFF` (coder), `VERDICT` (reviewer), `RESULT` (tester).

Before starting, load `project-context` if it is not already loaded, and read the task's spec or tasks (for example `specs/001-user-auth/tasks.md`) so you can give the coder concrete success criteria.

## The chain

1. **Builder.** Visual UI work (pages, components, layout, motion, copy) goes to `ui-ux`. Everything else (backend, database, shared packages, services, config, non-visual frontend logic) goes to `coder`. Give it the task, the spec or task ids, and what "done" means as something checkable. The coder starts on sonnet at high effort (its file sets this; do not pass a model).
2. **Reviewer.** Pass the builder's `HANDOFF`. Sonnet, high effort. It reports only and never edits.
3. **Tester.** Only after `VERDICT: APPROVE`. Pass the reviewer's `HANDOFF`. It edits test files and scripts only, never the source.
4. **Done** means `RESULT: PASS`. Report the result. Commit only when the user asks (use the `commit` skill).

## What to do with each result

- Coder `Status: DONE`: go to the reviewer. Never re-run a `DONE` coder on opus.
- Coder `Status: PARTIAL` or `STUCK`: run the coder again with `model: "opus"` and `effort: "high"`, giving it only the `Unsolved` and `Tried` items, not the whole task.
- Reviewer `CHANGES REQUESTED`: send the `Fix` list to the coder (sonnet first), then run the reviewer again.
- Tester `FAIL`: send the `Failures` list to the coder, then run the reviewer and tester again, because the code changed.
- An item that comes back a second time goes straight to opus.
- Haiku is not used for the coder.

## pstack stages (the rigor layer)

The `pstack@cursor-plugins` plugin (project scope) adds the stages below around the `coder`, `reviewer`, `tester` chain. It does not replace the chain. Skip a stage that does not fit the task (a typo needs none of them).

How to use pstack skills: they live at `~/.claude/plugins/cache/cursor-plugins/pstack/*/skills/<name>/SKILL.md` (newest version folder). The `Skill` tool refuses most of them, so read the file by path. Read `docs/harness/claude-code.md` in that folder once per session; it maps Cursor names to Claude Code. Subagents cannot start other agents, so any skill that spawns workers (`arena`, `swarm`, `interrogate`, `no-comments`) is run by you, the main session, never inside an agent.

1. **Understand** (you, read-only, only if the code is unfamiliar): `how` for how it works and where something belongs, `why` for the history and rationale.
2. **Design** (you, before the builder, non-trivial work): `architect` to sketch the types and signatures first. `arena` only when two real designs compete. `interrogate` when the design is contested.
3. **Build** (`coder`, or `ui-ux` for visual work): `tdd` (failing test first, then the fix), `typescript-best-practices` on any `.ts` or `.tsx`. Then clean up the diff: you run `no-comments`, and `deslop` if `cursor-team-kit` is installed. Do this before the reviewer.
4. **Test** (`reviewer`, then `tester`, then you): the reviewer applies `blast-radius`. The tester applies `principle-test-behavior-not-implementation` and `principle-prove-it-works`. You then run `interrogate` on the diff for risky changes, `swarm` for parallel coverage, and `benchmark-checklist` for any number someone measured. `create-verification-skill` is a one-time setup that builds a skill to drive the real app; offer it if the project has none. `thermo-nuclear-code-quality-review` is available only with `cursor-team-kit`.
5. **Ship**: off. The pstack playbooks `opening-a-pr`, `shipping`, `babysit`, `autopilot-full`, `autopilot-stack`, `autonomous-run` and `worktree-cleanup` push, open PRs and merge. Use the `commit` and `make-pr` skills, and only when the user asks.

Prose (PR text, docs, replies): `unslop` and `technical-writing` with the `make-pr` skill.

Overrides: the sonnet then opus ladder wins; do not pass pstack's default `opus xhigh`. `CLAUDE.md` wins over pstack on every conflict (ask on two readings, commit and merge only when asked, no attribution). Skip Cursor-only steps (Bugbot, automations) with one line saying so. `cursor-team-kit` (`deslop`, `thermo-nuclear-code-quality-review`) is not installed; do not claim to have run them.

## Keep what the agents learn

Every agent reads `.claude/learnings.md` before it starts and ends its block with a `Learned:` line. The agents cannot all write files (the reviewer is read-only), so you do it:

1. After each agent returns, take its `Learned:` line. Skip it if it says `none`, is vague, repeats an existing entry, or restates `CLAUDE.md` or `project-context`.
2. Add what passes as one line under that agent's heading in `.claude/learnings.md`. A rule that applies to every agent goes under Shared. Merge it into an existing line when it says the same thing.
3. Keep each section under 20 lines: merge or delete the weakest entries rather than growing the file.
4. Mention new entries in one line when you report. Do not commit them on your own; they go in with the user's next commit.

## When to stop and tell the user

- An item is still open after opus tried it.
- After 4 round trips through the loop.
- The tester returns `NOT VERIFIED` (part of the tests could not run).
- A task is marked manual in the tasks file (for example the Clerk keys and Dashboard steps): do not attempt it; say what the user must do.

When stopping, report what is done, what is open, what was tried, and what you need from the user.

## Rules that apply to every agent

- Keep each agent's brief short and specific. Do not paste the whole conversation.
- Schema changes only in `backend/db/src/schema.ts` plus `pnpm db:push`; no hand-written SQL.
- No `@radix-ui/*` packages (the repo uses Base UI). Never read or print `.env*` files.
- Tests are Jest (`pnpm test`), Playwright for end to end (`frontend/tests/e2e/`). Tests come before code where practical.
- Do not touch the user's own uncommitted files (anything in `git status` that the agents did not change).
- No `Co-Authored-By` or Claude attribution anywhere.

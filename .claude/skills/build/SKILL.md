---
name: build
description: Build, fix or debug a PlateMate feature by running the coder, reviewer and tester agents in order and looping failures back until the tester passes. Use when the user asks to build, implement, fix or debug code or a feature, or says "/build". Skip for questions, docs-only edits, or when the user says to skip the agents.
---

# Build

Run the work through the agents in `.claude/agents/`. Subagents cannot start each other, so **you** run the chain from the main session and read each agent's block: `HANDOFF` (coder), `VERDICT` (reviewer), `RESULT` (tester).

Before starting, load `project-context` if it is not already loaded, and read the task's spec or tasks (for example `specs/001-user-auth/tasks.md`) so you can give the coder concrete success criteria.

## Speckit plans, build executes

Speckit owns the plan once per feature: `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks`, `speckit-analyze`. This skill owns each task. Do not run `speckit-implement`; `build` runs the tasks so every one goes through the reviewer and tester.

- Take the next unchecked task from `specs/<feature>/tasks.md`. Read the task, then the parts of `plan.md`, `data-model.md` and `contracts/` it points at.
- A task marked manual (for example the Clerk keys and Dashboard steps): do not attempt it. Say what the user must do, then stop or move to a task that does not depend on it.
- When the task passes (`RESULT: PASS`), change its `- [ ]` to `- [x]` in `tasks.md`. Change nothing else in that file.
- When no unchecked tasks remain, run `speckit-converge` to find work the plan missed. Commit and open PRs only when the user asks.

## The chain

1. **Builder.** Visual UI work (pages, components, layout, motion, copy) goes to `ui-ux`. Everything else (backend, database, shared packages, services, config, non-visual frontend logic) goes to `coder`. Give it the task, the spec or task ids, and what "done" means as something checkable. The coder starts on sonnet at high effort (its file sets this; do not pass a model).
   **Tester, spec pass, in parallel.** For a task with behavior a user can see, start the tester in the same message as the builder, with only the success criteria and the words "spec first". It writes the tests and does not run them. Skip this for one-line, config-only and styling-only changes.
2. **Reviewer.** Pass the builder's `HANDOFF`. Sonnet, high effort. It reports only and never edits.
3. **Tester, run pass.** Only after `VERDICT: APPROVE`. Pass the reviewer's `HANDOFF` and the spec-pass files. It edits test files and scripts only, never the source.
4. **Done** means `RESULT: PASS`. Report the result. Commit only when the user asks (use the `commit` skill).

## What to do with each result

- Builder (coder or ui-ux) `Status: DONE`: go to the reviewer. Never re-run a `DONE` builder on opus.
- Tester `RESULT: SPEC READY`: the spec is written and was not run. Wait for the builder, then continue the chain.
- Builder `Status: PARTIAL` or `STUCK`: run the same agent again with `model: "opus"` and `effort: "high"`, giving it only the `Unsolved` and `Tried` items, not the whole task.
- Reviewer `CHANGES REQUESTED`: send the `Fix` list to the coder (sonnet first), then run the reviewer again as a delta pass.
- Tester `FAIL`: send the `Failures` list to the coder. If the fix is small (one file, under about 20 changed lines, no new logic branch), skip the comment cleanup and the reviewer and run the tester once on the whole suite. Otherwise run the cleanup, a delta review and the tester again, because the code changed.
- Delta pass: from the second reviewer pass on, give the reviewer its earlier findings and the diff since, and say it is a delta pass. It re-checks those findings and the changed lines only, and does not redo browser checks, which are the tester's job. Lint, build and react-doctor may come from the turbo cache.
- Run `no-comments` once per build, after the builder's first complete pass, and not after small fix rounds.
- An item that comes back a second time goes straight to opus.
- Haiku is not used for the coder.

## pstack stages (the rigor layer)

The `pstack@cursor-plugins` plugin (project scope) adds the stages below around the `coder`, `reviewer`, `tester` chain. It does not replace the chain. Skip a stage that does not fit the task (a typo needs none of them).

How to use pstack skills: they live at `~/.claude/plugins/cache/cursor-plugins/pstack/*/skills/<name>/SKILL.md` (newest version folder). The `Skill` tool refuses most of them, so read the file by path. Read `docs/harness/claude-code.md` in that folder once per session; it maps Cursor names to Claude Code. Subagents cannot start other agents, so any skill that spawns workers (`arena`, `swarm`, `interrogate`, `no-comments`) is run by you, the main session, never inside an agent.

1. **Understand** (you, read-only): **off for now.** The codebase is small, so `how` and `why` have little to explain. Turn this on when real code exists beyond the starter, when a task touches code nobody wrote recently, or when you need to know which package owns something: `how` for how it works and where something belongs, `why` for the history and rationale.
2. **Design** (you, before the builder): off by default. The shape was set during planning (`architect` runs inside `/speckit-plan`, constitution 1.2.0), so a task from `tasks.md` goes straight to the builder. Run `architect` only when the task needs a new type, module boundary or state owner that `plan.md`, `data-model.md` and `contracts/` do not define, `interrogate` when the plan leaves a design open or contested (for example the Row-Level Security approach), and `arena` only when two real designs compete.
3. **Build** (`coder`, or `ui-ux` for visual work): `tdd` (failing test first, then the fix), `typescript-best-practices` on any `.ts` or `.tsx`. Then clean up the diff once: you run `no-comments`, and `deslop` if `cursor-team-kit` is installed. Do this before the first review.
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
- Every agent follows the rules in `.claude/rules/` (`coding.md`, `testing.md`, `reviewing.md`, `frontend.md`, `ui-ux.md`, `backend.md`). Each agent file names the ones it reads.
- Do not touch the user's own uncommitted files (anything in `git status` that the agents did not change).
- No `Co-Authored-By` or Claude attribution anywhere.

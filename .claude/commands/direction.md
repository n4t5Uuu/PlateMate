---
description: Check whether the implementation is drifting from the plan (specs/ when it exists, otherwise CLAUDE.md, constitution and DESIGN.md)
argument-hint: "Optional feature folder or focus area"
---

Check whether the implementation is still aligned with the plan. Read-only: change nothing.

Focus (optional): $ARGUMENTS

## 1. Load the source of truth

- If `specs/` exists, read everything in it (plan, requirements/RDs, tasks). If `$ARGUMENTS` names a feature folder, limit to it.
- Always read `CLAUDE.md`, the rules in `.claude/rules/`, the `project-context` skill (stack, layout, decisions, forbidden list), `.specify/memory/constitution.md` if present, and `DESIGN.md` for frontend work.
- If `specs/` is missing or empty, say so in one line and use those docs as the plan for now. Judge only against what they actually state; do not invent requirements.

## 2. Load the implementation

- `git log --oneline -30` and `git status` / `git diff` (staged and unstaged) for recent work.
- Read the code that each requirement and plan item points to (`frontend/`, `backend/`, `packages/`, `services/`, `infra/`). Read the files; do not judge from names or commit messages.

## 3. Compare

For each requirement and plan decision, mark one of:

- **Aligned**: implemented as specified, with the file/line that proves it.
- **Drifting**: implemented differently (different stack, structure, behavior, or scope) than the plan says.
- **Missing**: required and planned, no implementation found. Only flag if the plan expects it to exist by now (tasks marked done, or work already started on it).
- **Unplanned**: code that no requirement or plan item asks for (scope creep).
- **Contradicts constitution or CLAUDE.md**: for example Radix packages, hand-written SQL migrations, or plates stored as editable instead of view-only.

## 4. Report

Start with one verdict line: `ALIGNED`, `MINOR DRIFT`, or `OFF COURSE`, plus one sentence why.

Then a table of only the non-aligned items: item, spec reference (file + section), what the code does instead (`path:line`), severity (high/med/low).

End with the one to three corrections that matter most: fix the code, or update the spec if the drift was a deliberate improvement. Say which, per item. Do not edit either.

State plainly anything you could not verify (unread files, features with no code yet, ambiguous spec wording). Do not report alignment you did not check.

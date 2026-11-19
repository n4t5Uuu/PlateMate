---
name: make-pr
description: Open a pull request using the repo's PR template, written in plain, human language. Use when the user says "open a PR", "make a PR", "create a pull request", or asks for a PR description.
---

# Pull request

Write the PR the way you would explain it to a teammate over coffee. No jargon walls.

## Steps

1. Run `git status`, `git log main..HEAD --oneline` and `git diff main...HEAD --stat`. Read the real changes.
2. Make sure everything is committed (use the `commit` skill if not) and the branch is pushed. Never push to `main`.
3. Check for an existing PR from this branch: `gh pr list --head <branch>`. If one is open, update it instead of making a new one.
4. Decide whether this needs its own PR (see One PR per module).
5. Fill in the PR template at `.github/pull_request_template.md`, or `.github/pr_template.md` if that is what the repo has. Keep its headings: Description, What did you do?, What to watch out for?
6. Open it with `gh pr create --base main --title "<title>" --body-file <file>`. Write the body to a file in the scratchpad, not inline, so formatting survives.
7. Give the user the PR link.

## Title

Same style as a commit: `feat(frontend): add plate upload`. Short and clear.

## How to fill the template

**Description**
Two or three plain sentences. What problem does this solve, and why now? Add `Closes #12` if it resolves an issue.

**What did you do?**
One `###` topic per thing a reviewer cares about, in everyday words. Say what the app can do now that it could not before. Add screenshots or a short video for anything visual.

**What to watch out for?**
Keep it only when there is something real: new packages (name them and say why), new environment variables, migrations to run, or known gaps. Delete the section if empty.

## Writing style

- Use "I" and everyday words. Say "you can now upload a plate", not "implemented the multipart presigned upload flow".
- Explain the why before the how.
- Short sentences. No walls of file names. Name a file only if the reviewer must look at it.
- Plain words for the technical bits: "the database now remembers who uploaded each version" beats "added uploaded_by FK".
- Be honest about what is unfinished or untested.

Before:
> Refactored the Drizzle schema to add a nullable FK on plate_versions and ran a migration.

After:
> Each plate version now remembers who uploaded it, so the history can show names. Run the new migration to pick it up.

## One PR per module

- One PR should tell one story. If the branch mixes separate modules (say database schema and the upload screen), split it into separate branches and PRs.
- If a PR for this area is already open or merged, do not pile new work onto it. Open a new PR for the new piece.
- When PRs depend on each other, say so in the Description ("Builds on #14") and open them in order. Base the second PR on the first PR's branch until the first merges.
- Keep PRs small enough to review in one sitting.
- Ask the user before splitting an existing branch into several.

## Do not

- Force-push, merge, or close PRs unless asked.
- Mark a PR ready or request reviewers unless asked.

Add the PR attribution line from the session's system reminder at the end of the body, if there is one.

---
name: commit
description: Make clean, small commits using Conventional Commits. Use when the user says "commit", "commit this", "save my work", or asks to squash or tidy commits.
---

# Commit

Make small commits that each do one thing. Never push unless asked.

## Steps

1. Run `git status` and `git diff` (staged and unstaged). Read what actually changed.
2. Check the branch. If on `main`, create a branch first (see Branches).
3. Split the changes into the smallest logical commits. One purpose per commit. If one file holds two unrelated changes, stage by hunk with `git add -p`.
4. For each commit: stage only its files by name (never `git add -A` or `git add .`), then commit.
5. Run `git log --oneline -n 10` and show the user what was made.

Never stage `.env*`, keys, or `node_modules`. If something looks like a secret, stop and tell the user.

## Message format (Conventional Commits)

```
<type>(<scope>): <short summary>

<optional body: why, not what>
```

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scope is the area: `frontend`, `backend`, `db`, `shared`, `file-processor`, `infra`, `deps`.
- Summary: imperative mood ("add", not "added"), lowercase, no period, 72 characters or fewer.
- Body: explain why the change was made, wrapped at 72 characters. Skip it when the summary says enough.
- Breaking change: add `!` after the type (`feat(db)!:`) and a `BREAKING CHANGE:` line in the body.
- Reference issues in the footer: `Closes #12`.

Examples:

```
feat(frontend): add plate upload dropzone
fix(backend): reject uploads over the size limit
chore(deps): add drizzle-orm to the db package
```

## Micro-commit rules

- Commit when one thing works, not at the end of the day.
- Each commit should leave the project building. Do not split a change so that the middle commit is broken.
- Keep these apart: moves/renames, formatting, dependency changes, and real logic. Rename or move files in their own commit so git tracks the history.
- Tests go with the code they test.

## Squashing

Squash only commits that have not been pushed, or are on a feature branch the user owns.

- Tidy before opening a PR: fixups, "wip", typo fixes, and commits that undo each other get folded into the commit they belong to.
- Use `git commit --fixup <sha>` then `git rebase -i --autosquash <base>`. If interactive rebase cannot run in this environment, use `git reset --soft <base>` and re-commit in clean pieces.
- Never rewrite `main` or anything others may have pulled. Never force-push unless the user says so; if they do, use `--force-with-lease`.
- Keep meaningful micro-commits. Squash noise, not history. When the PR is merged, the user may choose squash-merge on GitHub, which is fine too.

## Branches

Name them `<type>/<short-kebab-description>`, for example `feat/plate-upload`, `fix/annotation-offset`.

## Attribution

End each commit message with the attribution lines given in the session's system reminder, if there are any.

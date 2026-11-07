---
name: docs
description: Write and update project documentation on GitHub (README, setup guides, architecture decisions, changelog). Use when the user asks to document something, update the README, write a guide, record a decision, or update the changelog.
---

# Docs

Follow common open-source practice. Docs live in the repo, are written in Markdown, and change in the same PR as the code they describe.

## Where things go

| What | File | Purpose |
|---|---|---|
| Project overview | `README.md` | What it is, features, how to run it. First thing people read. |
| Contributing | `CONTRIBUTING.md` | Branch names, commit style, how to open a PR |
| Change history | `CHANGELOG.md` | What changed per release ([Keep a Changelog](https://keepachangelog.com) format) |
| Decisions | `docs/adr/NNNN-title.md` | Why we chose something (Architecture Decision Records) |
| How-to and reference | `docs/*.md` | Setup, environment variables, API, database, deployment |
| Package notes | `<package>/README.md` | What a workspace does and how to use it |

Create only what is needed. Do not add empty files.

## Organise by what the reader needs (Diataxis)

Keep these four kinds apart, not mixed in one page:

- **Tutorial:** learn by doing, step by step ("Run PlateMate locally").
- **How-to guide:** solve one task ("Add a new plate file format").
- **Reference:** facts to look up (env variables, API routes, schema).
- **Explanation:** background and reasons (why versions branch as design options).

## Steps

1. Read the code or change being documented. Never document from memory or guess.
2. Find the existing doc that should hold it. Update that one before creating a new file.
3. Write it, then check every command and path by running or reading it.
4. Link related docs. Keep headings stable so links do not break.
5. If the change is user-visible, add a line under `## [Unreleased]` in `CHANGELOG.md`.

## Writing rules

- Start with what the page is for in one sentence.
- Short sentences, plain words, second person ("you").
- Put commands in fenced code blocks with a language tag. Show expected output when it helps.
- Use tables for lookups, lists for steps, prose for reasons.
- One topic per page. Prefer links over copying text.
- Say what is not done yet instead of hiding it.
- Never put secrets or real keys in docs. Show `.env.example` values.

## ADR template

```markdown
# 0001. Title of the decision

Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by 000X

## Context
What problem or choice are we facing?

## Decision
What we chose.

## Consequences
What gets easier, what gets harder.
```

## Changelog format

```markdown
## [Unreleased]
### Added
### Changed
### Fixed
### Removed
```

## Keeping docs honest

- Doc changes go in the same PR as the code change.
- When asked to "update the docs", compare against the current code and fix anything that no longer matches.
- Commit docs with the `docs:` type, using the `commit` skill.

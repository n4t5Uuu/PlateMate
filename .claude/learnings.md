# Project learnings

What the agents learned while working on PlateMate, kept so the next run does not repeat a mistake. Agents read this file before they start. The main session (the `build` skill) adds entries after each agent finishes. Entries are short, concrete rules.

## What belongs here

- Something this repo does that is not obvious from the code or `CLAUDE.md`, and that cost time or caused a mistake.
- A fix that worked for a failure that could come back, or an approach that failed and why.
- A correction the user gives you, written as a rule under Shared.
- Written as a rule: "Always use X for Y", "Never do X because Y". One line each, with the file or command if it helps.

## What does not belong here

- Anything already in `CLAUDE.md`, `project-context`, the constitution or the code.
- Task history ("fixed the login bug"), guesses, or things that were not verified.

Keep each section under 20 lines. When a section is full, merge or delete the weakest entries. Delete an entry when the cause is gone.

## Shared

- With `cacheComponents` on, Next keeps the previous route mounted but hidden (`display:none`, effects cleaned up and re-run). Never retain `children` as a snapshot, give ids from a form that can render twice a `useId()` prefix, scope queries and Playwright locators with `:visible`, and test back and forward in a built app: React will not re-apply an unchanged prop after a cleanup removed an attribute.
- With `cacheComponents` on, a client component that reads the URL (`usePathname`, `useSelectedLayoutSegment`) makes a production page render blank on the server even inside Suspense. Derive the mode in each server page and pass it down, then `curl` the production build to check the server HTML for the h1.

## coder

(none yet)

## reviewer

- Run `pnpm build` before `pnpm test:e2e` and check nothing listens on the Playwright port, because a reused server can serve a stale build.

## tester

- Before asserting computed focus styles on shadcn buttons (`transition-all`), wait for CSS transitions to finish; filter `document.getAnimations()` by `playState`, because finished fill-forwards animations stay in the list.

## ui-ux

- `npx shadcn@latest add` writes `import { cn } from "cn"` and adds that unrelated package: rewrite the import to `@/lib/utils` and revert `package.json` and `pnpm-lock.yaml` with `git checkout` (not `pnpm remove`, which re-resolves the lockfile).
- Tailwind v4 `outline-none` sets `outline-style: none` unconditionally, so `focus-visible:outline-*` never shows. Use `focus-visible:ring-[3px] focus-visible:ring-ring` and check the computed style after a real Tab press.
- Before calling an animation fix behavior-identical, sample computed opacity per frame; a transition on a class swap can silently never run. Use a keyframe animation for both the fade-in and the fade-out.

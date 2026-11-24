---
paths:
  - "frontend/**"
---

# UI and UX rules

For anyone designing, building, changing, critiquing or polishing the UI. Code rules for the frontend are in `frontend.md`.

## Always use Impeccable

Any request to design, build, change, critique, review or polish anything in the UI (pages, components, layout, color, type, motion, copy, responsive behavior) goes through the `impeccable` skill. Invoke it with the Skill tool before touching UI code, then pick the command that matches the prompt. Do not hand-style UI without it. Source: https://github.com/pbakaus/impeccable (docs: https://impeccable.style/docs).

Usage: `/impeccable <command> <target>`, for example `/impeccable critique the plate viewer`. Narrow targets work better than whole pages. With no clear command, describe the request and let the skill route it.

| Prompt sounds like                                  | Command                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| "plan the UX for X"                                 | `shape`                                                              |
| "make X" / new page or screen                       | new-work (no command needed; the skill routes it)                    |
| "make it bolder / safer designs feel bland"         | `bolder`                                                             |
| "too loud / too busy"                               | `quieter`                                                            |
| "simplify / remove clutter"                         | `distill`                                                            |
| "add color"                                         | `colorize`                                                           |
| "fix fonts, hierarchy, sizing"                      | `typeset`                                                            |
| "fix spacing, rhythm, alignment"                    | `layout`                                                             |
| "add animation / transitions"                       | `animate`                                                            |
| "add personality"                                   | `delight`                                                            |
| "push it further (shaders, spring, scroll effects)" | `overdrive`                                                          |
| "review the design / what's wrong with it"          | `critique` (scored UX review)                                        |
| "check accessibility, performance, responsive"      | `audit` (technical report, P0 to P3)                                 |
| "final pass before shipping"                        | `polish`                                                             |
| "handle errors, empty, overflow, i18n, edge cases"  | `harden`                                                             |
| "rewrite unclear copy, labels, error messages"      | `clarify`                                                            |
| "make it work on phone / other screens"             | `adapt`                                                              |
| "it feels slow / loads badly"                       | `optimize`                                                           |
| "first-run, empty states, onboarding"               | `onboard`                                                            |
| "try variants in the browser"                       | `live` (pick an element) or `generate` (variants of a named element) |
| "pull repeated patterns into a design system"       | `extract`                                                            |
| "write down the visual system"                      | `document` (writes `DESIGN.md`)                                      |
| "capture product context"                           | `init` (writes `PRODUCT.md`)                                         |

Setup state: `frontend/PRODUCT.md` exists (written by `/impeccable init` from `docs/PRD.md`); `DESIGN.md` does not yet. Run `/impeccable document` after the first real UI exists, so later commands stay on-brand. Other commands: `/impeccable pin <command>` makes `/<command>` a shortcut, `/impeccable hooks <on|off|status>` manages the design hook, `/impeccable doctor` repairs stale setup. `craft` is a deprecated alias for a plain build request.

Slop check outside the agent: `npx impeccable detect .` from `frontend/` (add `http://localhost:3000` to include rendered-page rules). Exit code 2 means findings.

Impeccable works alongside the stack, not instead of it: build with shadcn/ui and Tailwind, animate with motion-primitives, and let Impeccable steer the design decisions.

## The user picks the layout

When Impeccable asks which layout, direction or variant to use, do not answer for it and do not choose a default. Relay the options to the user as Impeccable gave them (use AskUserQuestion if you have it, otherwise end your reply with the options and stop), wait for the answer, then pass it back to Impeccable. This holds even for small pages, when the request seems to imply a favorite, and when running through the `ui-ux` agent.

## Emil Kowalski skills: use alongside Impeccable

The skills from https://github.com/emilkowalski/skills are installed in `.claude/skills/`. Impeccable decides the design (layout, color, type, copy), and Emil's skills set the motion and interaction details. Run Impeccable first, then an Emil skill for the motion and polish pass.

- **Motion:** `animate` (build from scratch), `review-animations` (strict review), `choreograph` (several elements moving together), `animation-performance` (dropped frames), `remove-animations` (cut motion that is not needed).
- **Interaction and polish:** `emil-design-eng` (press, hover, popover and tooltip details), `gestures` (drag, swipe, sheets), `break-ui` (worst-case data), `mobile-native` (phone feel).
- **Libraries:** `pick-ui-library` before adding a UI dependency, `ask-sonner` for toasts.
- Name clash: `animate` is Emil's skill; Impeccable's is `/impeccable animate`. Say which one you mean.
- If the two disagree, Impeccable and `DESIGN.md` win on layout, color, type, surfaces and motion values. Ignore the typography and material advice in `apple-design` and `emil-design-eng` when Impeccable has decided it.

## Verify, then report

- For visual changes, look at them in a browser at desktop and phone width (the app runs at `http://localhost:3000`; if it is not running, ask before starting `pnpm dev`). Describe what changed.
- Report briefly: what you changed and why, which skills and commands you used, what you checked, and anything you could not verify. Do not claim a UI works if you did not look at it.

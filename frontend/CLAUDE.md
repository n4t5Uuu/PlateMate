# Design basis

[`DESIGN.md`](./DESIGN.md) at the repo root is the design basis for every
frontend component — colors, typography, spacing, page sections, and the
component inventory. Read it before building or styling any component, and
keep new components consistent with its tokens and conventions rather than
introducing new ones ad hoc.

# Frontend rules

- **No long Tailwind strings inline in JSX.** Anything past a few utilities
  goes in a descriptive `const` above the component (e.g. `const
navLinkClasses = "..."`) or into a cva variant. JSX should read as
  structure, not styling — see `src/components/navbar.tsx` and
  `src/components/ui/button.tsx` for the pattern.
- **Keep components small** — aim for well under 150 lines each. Reach for
  an existing primitive in `src/components/ui/` or `@base-ui/react` before
  writing a new one.
- **shadcn/ui is our main UI library.** Build every screen from shadcn
  components first; only reach for something else when shadcn has no
  equivalent. It is installed (`components.json`, `components/ui/`,
  `lib/utils.ts`).
- This repo is shadcn v4 on **Base UI** (`components.json` → `"base-nova"`),
  not Radix — never add `@radix-ui/*`. Add primitives with `npx shadcn@latest
add <component>` and extend the generated source directly for one-off
  variants instead of wrapping it.
- `cn` (clsx + tailwind-merge) lives at `@/lib/utils` — reuse it for
  conditional classes.
- Read [`../DESIGN.md`](../DESIGN.md) before styling or adding a component —
  colors, type scale, spacing/radius, and page section list all live there.
- Use the `glass` utility (`src/app/globals.css`) for translucent surfaces —
  don't hand-roll `backdrop-filter`.

## UI and design work: always use Impeccable

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

**The user picks the layout.** When Impeccable asks which layout, direction or variant to use, relay the options to the user and wait for their choice. Never pick one on the user's behalf, including when running through the `ui-ux` agent.

## Emil Kowalski skills: use alongside Impeccable

The skills from https://github.com/emilkowalski/skills are installed in `.claude/skills/`. Use them together with Impeccable, not instead of it: Impeccable decides the design (layout, color, type, copy), and Emil's skills set the motion and interaction details.

- **Motion:** `animate` (build from scratch), `review-animations` (strict review), `choreograph` (several elements moving together), `animation-performance` (dropped frames), `remove-animations` (cut motion that isn't needed).
- **Interaction and polish:** `emil-design-eng` (press, hover, popover and tooltip details), `gestures` (drag, swipe, sheets), `break-ui` (worst-case data), `mobile-native` (phone feel).
- **Libraries:** `pick-ui-library` before adding a UI dependency, `ask-sonner` for toasts.

When both apply, run Impeccable first for the design, then an Emil skill for the motion and polish pass. For motion, invoke the Emil skill by its own name (`/animate` is Emil's; Impeccable's version is `/impeccable animate`). If the two disagree on a motion value, DESIGN.md wins once it exists.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

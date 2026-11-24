---
paths:
  - "frontend/**"
---

# Writing the frontend

For anyone writing code under `frontend/`. Design decisions are in `ui-ux.md`; general code rules are in `coding.md`.

- **Design basis.** `DESIGN.md` at the repo root is the design basis for every component: colors, typography, spacing, page sections and the component inventory. Read it before building or styling any component, and keep new components consistent with its tokens instead of adding new ones ad hoc. If it does not exist yet, follow the existing tokens in `frontend/app/globals.css`.
- **No long Tailwind strings inline in JSX.** Anything past a few utilities goes in a descriptive `const` above the component (for example `const navLinkClasses = "..."`) or into a cva variant. JSX should read as structure, not styling. See `src/components/navbar.tsx` and `src/components/ui/button.tsx` for the pattern.
- **Keep components small**, well under 150 lines. Reach for an existing primitive in `src/components/ui/` or `@base-ui/react` before writing a new one.
- **shadcn/ui is the main UI library.** Build every screen from shadcn components first; reach for something else only when shadcn has no equivalent. It is installed (`components.json`, `components/ui/`, `lib/utils.ts`).
- **Base UI, not Radix.** This repo is shadcn v4 on Base UI (`components.json` is `"base-nova"`). Never add `@radix-ui/*`. Add primitives with `npx shadcn@latest add <component>` and extend the generated source directly for one-off variants instead of wrapping it.
- `cn` (clsx and tailwind-merge) lives at `@/lib/utils`; use it for conditional classes.
- Use the `glass` utility (`src/app/globals.css`) for translucent surfaces; do not hand-roll `backdrop-filter`.
- **Next.js here has breaking changes.** Before writing Next code, read the relevant guide in `frontend/node_modules/next/dist/docs/`.
- Respect reduced motion, keyboard use, focus states and contrast, and check phone width.
- Do not touch backend, database or infra code. If a UI task needs an API or schema change, stop and report it instead of making it.
- Run `pnpm lint`, `pnpm build` and `pnpm --filter @platemate/frontend react-doctor`, and fix what they report at the cause.

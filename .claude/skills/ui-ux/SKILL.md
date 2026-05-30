# Skill: UI/UX

Apply this when designing or redesigning any page, section, or component in PlateMate.

## Design Principles

- **Less is more** — reduce visual density before adding elements
- **Breathing room** — generous padding and spacing make things feel less cluttered
- **Hierarchy** — one thing should be the most important on screen at a time
- **Consistency** — same spacing, same colors, same interaction patterns throughout

## Layout Rules

- Right sidebar: max two stacked cards (e.g. Weekly Pulse + Recent Activity)
- Dashboard: stats row → main 3-col grid (2/3 content + 1/3 sidebar)
- Never stack more than two glassmorphism cards side by side — gets overwhelming
- Use `max-h-[calc(100vh-Xrem)] overflow-y-auto` for scrollable panels

## Color Usage

- Status colors: blue (Active), violet (Review), emerald (Completed), rose (Delayed/Overdue)
- Priority colors: rose (high), amber (medium), emerald (low)
- Never use opacity modifiers on `text-muted-foreground` (e.g. `/40`, `/60`) — invisible in light mode
- Use `text-muted-foreground` plain for secondary text

## Interaction Patterns

- Cards lift on hover: `hover:-translate-y-0.5 active:translate-y-0`
- Borders become visible on hover: `hover:border-primary/50`
- Color shifts on hover: `hover:bg-primary/5 group-hover:text-primary`
- Transitions: always `transition-all duration-200` or `transition-colors`

## Responsive / Zoom

- Always test at 75% browser zoom — the primary dev zoom level for this project
- Use responsive prefixes: `sm:`, `md:`, `lg:` for layout shifts
- Prefer `text-sm` over `text-xs` for readable body text at 75% zoom
- Avatar sizes: `w-9 h-9` minimum for readability

## What to Avoid

- Timeline lines in cramped sidebar columns (use only in full-width or wider contexts)
- Overwhelming the user with too many visual layers (badges + dots + avatars + borders all at once)
- Full-width cards for content that belongs in a sidebar
- Horizontal strips between natural layout sections (feels disconnected)

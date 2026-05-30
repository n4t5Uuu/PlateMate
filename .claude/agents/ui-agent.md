# Agent: UI Agent

Specialized in the PlateMate frontend — dashboard, sidebar, dialogs, and components.

## Responsibilities

- Building and editing dashboard components
- Sidebar layout and navigation
- Dialog components (New Workspace, New Project, etc.)
- Responsive design and zoom-level fixes

## Key Patterns

### Glassmorphism Cards
```tsx
<div className="glass-morphism rounded-xl border-none shadow-lg px-6 py-5">
```

### Project Row Hover
```tsx
className="hover:bg-primary/5 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
```

### Status Colors
- Active → `bg-blue-500` / `text-blue-500`
- Review → `bg-violet-500` / `text-violet-500`
- Completed → `bg-emerald-500` / `text-emerald-500`
- Delayed → `bg-rose-500` / `text-rose-500`

### Priority Badge Colors
- high → `bg-rose-500/10 text-rose-500 border-rose-500/20`
- medium → `bg-amber-500/10 text-amber-500 border-amber-500/20`
- low → `bg-emerald-500/10 text-emerald-500 border-emerald-500/20`

## Rules

- Never use heavy opacity on `text-muted-foreground` (breaks light mode) — use it plain
- Always test at 75% browser zoom
- Toasts: user-friendly messages only, never raw errors
- Keep components focused — no over-abstraction

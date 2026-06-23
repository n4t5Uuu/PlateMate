# PlateMate — Claude Context

PlateMate is an architectural project management web app made in Next.js built for architects to manage projects, tasks, teams, and workspaces. Specially made for those who are in the field of architecture and has a versioning system for the revision of plates. Users can annotate, have a mood board for collection inspiration for their project,  

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Database / Auth**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth SSR**: @supabase/ssr
- **Toasts**: Sonner
- **Icons**: Lucide React

## Commands

```bash
npm run dev       # start dev server (localhost:3000)
npm run build     # production build
npm run lint      # lint check
.\combine-schema.ps1   # combine all SQL files → copies to clipboard for Supabase SQL Editor
```

## Project Structure

```
src/
  app/
    page.tsx                  # root → renders AuthPage (login/signup)
    auth-page.tsx             # login + signup form
    dashboard/                # main dashboard (stats, projects, pulse, activity)
    projects/                 # projects list + [id] detail page
    calendar/ teams/ trash/   # placeholder pages
    api/auth/callback/        # Supabase auth code exchange route
  components/
    general-components/       # Sidebar, layout wrappers
    dialogs/                  # NewWorkspace, NewProject dialogs
    providers/                # AuthProvider (React context for user state)
    ui/                       # shadcn/ui primitives
  hooks/
    use-auth.ts               # access AuthProvider context
    use-workspaces.ts         # fetch + create workspaces
    use-projects.ts           # fetch + create projects
    use-project-details.ts    # fetch details, versions, annotations, checklists, crits, moodboard
  lib/
    supabase/
      browser.ts              # browser-side Supabase client
      server.ts               # server-side Supabase client (SSR)
      schema/                 # all SQL files (tables, functions, triggers, policies)
    workspace-helper.ts       # Supabase workspace CRUD
    auth-helper.ts            # maps Supabase user → app User type
    security.ts               # sanitizeInput helper
  data/
    sidebar-data.ts           # static nav items for sidebar
  types/                      # TypeScript type definitions
middleware.ts                 # session refresh + route protection
combine-schema.ps1            # PowerShell script to combine SQL files
```

## Key Patterns

### Error Handling
- **Frontend Presentation**: Always display clean, user-friendly error messages (e.g., user-friendly banners, toasts) in the UI; never show raw DB errors, sql identifiers, or diagnostic instructions.
- **Backend Logging**: Always log raw database and internal errors using `console.error("[functionName]", error)` in helper layers.
- Use `extractMessage(error)` in helpers to safely get a string from any error type (handles Supabase `PostgrestError` which is not a native JS `Error`)

### Supabase Clients
- Use `browserSupabase` in client components and hooks
- Use `createServerSupabase()` in Server Components and API routes
- Middleware has its own inline client setup (required by Next.js edge runtime)

### RLS + SECURITY DEFINER
- All RLS-bypassing operations use `SECURITY DEFINER` PostgreSQL functions
- Example: `create_workspace_with_owner()` — used for new workspace creation to solve the chicken-and-egg problem (can't be a member before adding yourself as owner)
- All such functions use fully-qualified table names: `public.tbl_workspaces`, not just `tbl_workspaces`

### SQL Schema
- All schema lives in `src/lib/supabase/schema/`
- Run `.\combine-schema.ps1` to concatenate files in the correct order and copy to clipboard
- Order matters: plpgsql functions → tables → sql-language functions → triggers → policies
- `LANGUAGE sql` functions validate table existence at creation time — they must come after `create_tables.sql`

### Styling
- Use `glass-morphism` class for cards/panels
- Use `text-muted-foreground` without heavy opacity for readable light-mode text
- Hover states: `hover:bg-primary/5 hover:border-primary/50 hover:-translate-y-0.5`
- Responsive: always consider 75% browser zoom
- **Whitespace / Spacing**: Always design UI layouts to stretch and fill the available screen space (e.g. using `w-full` on main page containers, and sidebars/grids to span the full viewport), avoiding narrow page containers that leave awkward empty whitespace.

## Auth Flow

1. User signs up → Supabase inserts into `auth.users`
2. `on_auth_user_created` trigger fires → `handle_new_auth_user()` copies to `tbl_users`
3. `on_user_created_create_workspace` trigger fires → `create_workspace_for_new_user()` creates "[FirstName]'s Workspace"
4. Middleware checks session on every request and refreshes JWT silently

## Read Before Changing

- `combine-schema.ps1` — file order is critical, do not reorder
- `middleware.ts` — must use `getUser()` not `getSession()` (security)
- `workspace-helper.ts` — uses RPC `create_workspace_with_owner` not direct inserts (RLS bypass)

## Interaction Style

- **Code Modification Rule**: Every time the user asks you to write, modify, or add code, show the code blocks/diffs in the chat response so the user can type/write it down to better understand it. Do NOT write directly to the filesystem or edit files using code writing tools.
- **Show Minimal Revisions**: When presenting code snippets for the user to copy, show only the specific lines of code that need modification, clearly indicating where the revisions start and end (using line numbers, context lines, or clear comments) instead of outputting the full file contents.
- **Exception**: Only modify/write files directly if the user explicitly asks you to do so for that specific instance.


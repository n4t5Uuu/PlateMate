# Service Architecture

## Overview

PlateMate is a Next.js App Router application. All pages are server-rendered by default; client interactivity is opt-in via "use client".

## Request Flow

```
Browser request
    ↓
middleware.ts          (server — validates session, refreshes JWT, redirects)
    ↓
Next.js page/layout    (server component — can use createServerSupabase())
    ↓
AuthProvider           (client — syncs session into React state via onAuthStateChange)
    ↓
Hooks / Helpers        (client — browserSupabase for data fetching and mutations)
```

## Auth Architecture

- **Supabase Auth** handles credential storage and JWT issuance
- **middleware.ts** refreshes expired tokens on every request (silent re-auth)
- **AuthProvider** (`src/components/providers/auth-provider.tsx`) holds the React user state
- **useAuth** hook gives any client component access to `user`, `login`, `signUp`, `signOut`

## Database Access Layers

```
Component / Page
    ↓
Custom Hook (use-workspaces.ts, use-projects.ts)
    ↓
Helper (workspace-helper.ts, project-helper.ts)
    ↓
browserSupabase / createServerSupabase()
    ↓
Supabase (PostgreSQL + RLS)
```

## Key Services

| Service | File | Purpose |
|---------|------|---------|
| Auth context | `src/components/providers/auth-provider.tsx` | React state for logged-in user |
| Workspace CRUD | `src/lib/workspace-helper.ts` | Create/fetch workspaces |
| Browser client | `src/lib/supabase/browser.ts` | Client-side Supabase |
| Server client | `src/lib/supabase/server.ts` | SSR Supabase |
| Middleware | `middleware.ts` | Session + routing |
| Schema script | `combine-schema.ps1` | SQL deployment tool |

## RLS Strategy

- All tables have Row Level Security enabled
- Users can only access data within their workspaces
- `is_workspace_member(workspace_id)` and `is_workspace_owner(workspace_id)` are helper functions used in policies
- SECURITY DEFINER functions (`create_workspace_for_new_user`, `create_workspace_with_owner`) bypass RLS for operations that need elevated access

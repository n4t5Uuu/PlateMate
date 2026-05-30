# Local Setup

For full build/deploy instructions see [../../agent_docs/building_the_project.md](../../agent_docs/building_the_project.md). This guide is the quick version.

## Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)

## Steps

**1. Clone and install**
```bash
npm install
```

**2. Create `.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Find both values in Supabase → Project Settings → API.

**3. Deploy the database schema**
```powershell
.\combine-schema.ps1
```
This combines all SQL files in the correct order and copies to clipboard. Then:
- Open Supabase → SQL Editor → New Query
- Paste and run

**4. Start dev server**
```bash
npm run dev
```

Open http://localhost:3000

## First run checklist

- [ ] Sign up with a new account
- [ ] Confirm you land on `/dashboard`
- [ ] Confirm a workspace appears in the sidebar ("Alden's Workspace")
- [ ] Confirm refreshing the page keeps you logged in (auto-login via middleware)
- [ ] Confirm signing out redirects to `/`

## Common issues

**"relation tbl_workspaces does not exist"** — The schema wasn't deployed. Run `combine-schema.ps1` and paste into SQL Editor.

**"Database error saving new user"** — Usually means the trigger functions have the wrong schema prefix. All SECURITY DEFINER functions must use `public.tbl_tablename`.

**"[object Object]" in toast** — A raw error object is being passed to `toast.error()`. Use `extractMessage(error)` from the error handling pattern.

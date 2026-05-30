# Session Handoff

Last updated: 2026-05-13

## What's Been Built

### Auth
- Supabase email/password signup and login
- `on_auth_user_created` trigger syncs `auth.users` → `tbl_users` on signup
- `on_user_created_create_workspace` trigger auto-creates "[FirstName]'s Workspace" on signup
- `middleware.ts` handles session refresh and route protection (auto-login on return visits)
- Auth callback route at `/api/auth/callback` for email confirmation redirects

### Dashboard UI
- Stats cards row (Active Projects, Pending Tasks, Team Members, Completed)
- Active Projects list (ProjectRow) with status dot, priority badge, progress bar, due date, team count
- Weekly Pulse sidebar card (Completed / Due Today / Meetings / Overdue)
- Recent Activity sidebar card (compact list with small avatars + timeline line)
- Layout: 3-col grid (projects 2/3 + pulse+activity 1/3) — all sample data for now

### Sidebar
- Sections: General, Workspace, Pinned, Quick Actions
- Workspace section renders real workspaces from useWorkspaces() hook
- Workspace creation uses create_workspace_with_owner RPC (bypasses RLS chicken-and-egg)

### Database
- All tables, RLS policies, triggers and functions deployed to Supabase
- combine-schema.ps1 combines all SQL in correct order

### Error Handling
- extractMessage() safely extracts string from any error type incl. Supabase PostgrestError
- All dialogs show user-friendly toasts, never raw DB errors
- All helpers log raw errors via console.error

## What's Next

- [ ] Wire up real projects to dashboard (replace sample data)
- [ ] Wire up real pinned projects to sidebar
- [ ] Build Projects page (/projects)
- [ ] Build workspace detail page (/workspace/[id])
- [ ] Hook up New Project dialog to DB
- [ ] Build Teams and Calendar pages

## Known Issues

- tbl_projects.owner_id has NOT NULL + ON DELETE SET NULL — contradictory, fix when building delete flows
- Dashboard stats cards are hardcoded — need real DB queries
- samplePinnedProjects in sidebar-data.ts is still static
- /workspace/[id] page does not exist yet

## SQL Schema Deployment

Run .\combine-schema.ps1 → paste into Supabase SQL Editor → Run.

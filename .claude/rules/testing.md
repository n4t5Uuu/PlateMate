---
description: Testing rules and manual checklist for this project
paths:
  - "**/*"
---

# Testing Rules

## Current State

No automated test suite exists yet. All testing is manual. The `agent_docs/running_tests.md` file has the full manual checklist.

## Rules When Tests Are Added

- **Do not mock the database.** Tests must hit a real Supabase instance (use a dedicated test project, not production)
- Mocked DB tests can pass while prod migrations silently break things — this has happened before
- RLS policies must be tested explicitly — verify that a user in workspace A cannot read data from workspace B
- Trigger functions (`handle_new_auth_user`, `create_workspace_for_new_user`) must be tested as part of the signup flow, not in isolation

## What Must Be Tested Before Any Merge

Auth flow:
- [ ] Sign up creates a row in `tbl_users` and a default workspace in `tbl_workspaces`
- [ ] Sign in lands on `/dashboard`
- [ ] Refreshing the page while signed in keeps the user on `/dashboard` (auto-login)
- [ ] Visiting `/` while signed in redirects to `/dashboard`
- [ ] Visiting `/dashboard` while signed out redirects to `/`
- [ ] Sign out lands on `/`

Workspace:
- [ ] Default workspace appears in the sidebar after signup
- [ ] "New Workspace" dialog creates a workspace and it appears in the sidebar immediately
- [ ] Workspace names are sanitized (no raw HTML in the name)

Projects (when built):
- [ ] Creating a project from the dialog saves it to the DB
- [ ] Projects are scoped to the active workspace — user A cannot see user B's projects
- [ ] Project cards on dashboard reflect real DB data

Dashboard:
- [ ] Stats cards render without errors
- [ ] No negative counts or NaN values
- [ ] Activity feed renders without errors on an empty state

## What NOT to Test

- Supabase internals (their auth, JWT, cookie management)
- shadcn/ui component behavior
- Next.js routing behavior
- Anything already covered by the library's own test suite

## Error Scenarios to Always Cover

- Creating a workspace with an empty name
- Submitting a form while already submitting (double-submit)
- Network failure during a mutation (toast should show error, not crash)
- Visiting a workspace/project that doesn't belong to the current user (RLS should return empty, not throw)

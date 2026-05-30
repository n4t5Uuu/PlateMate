# Workspaces

## What it is

A workspace is the top-level container for projects and team members. Think of it like an organization (GitHub) or a team (Notion). Every user starts with one default workspace created automatically on signup.

## Default Workspace on Signup

When a new user signs up, a trigger fires:

```
on_user_created_create_workspace
  → create_workspace_for_new_user()
  → Inserts "[First]'s Workspace" into tbl_workspaces
  → Inserts the user as 'owner' into tbl_workspace_members
```

The first name is extracted from the user's `first_name` field using `SPLIT_PART`. So "Alden Alexander" becomes "Alden's Workspace".

## Creating Additional Workspaces

Done via the "New Workspace" dialog in the sidebar. Because of the RLS chicken-and-egg problem (you can't be a member before you're an owner, but you need to be a member to pass the INSERT policy), workspace creation uses an RPC:

```ts
supabase.rpc("create_workspace_with_owner", { workspace_name: name })
```

The `create_workspace_with_owner` function is `SECURITY DEFINER` — it runs as the function owner (bypassing RLS) and atomically inserts both the workspace and the caller as owner.

## Membership and Roles

| Role | Can do |
|------|--------|
| owner | All CRUD on workspace, add/remove members |
| member | Read workspace, read/write projects within it |

Membership is tracked in `tbl_workspace_members`. RLS policies on workspace tables use `is_workspace_member(workspace_id)` and `is_workspace_owner(workspace_id)` helper functions.

## Sidebar Display

Workspaces are fetched via the `useWorkspaces` hook and displayed in the sidebar. Each workspace links to `/workspace/[id]` (page not yet built). The bottom item is always "New Workspace" to create additional workspaces.

## What's next

- Workspace detail page (`/workspace/[id]`)
- Invite members to a workspace
- Workspace settings (rename, delete)

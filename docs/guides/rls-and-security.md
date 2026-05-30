# RLS & Security Model

## What RLS is

Row Level Security (RLS) is a PostgreSQL feature that filters which rows a query can see or modify, based on who's running it. In Supabase, `auth.uid()` returns the UUID of the currently authenticated user.

When a client calls `browserSupabase.from("tbl_projects").select()`, Supabase automatically appends the RLS policies as WHERE clauses. Without a matching policy, the query returns nothing (or errors on write).

## The membership model

Access in PlateMate is workspace-scoped. Two helper functions drive all policies:

```sql
is_workspace_member(workspace_id UUID) → BOOLEAN
is_workspace_owner(workspace_id UUID) → BOOLEAN
```

These check `tbl_workspace_members` for a row matching `(workspace_id, auth.uid())` with the appropriate role.

## Policy pattern

```sql
-- Read: any workspace member
CREATE POLICY "workspace members can select projects"
ON tbl_projects FOR SELECT
USING (is_workspace_member(workspace_id));

-- Write: workspace owner only
CREATE POLICY "workspace owners can insert projects"
ON tbl_projects FOR INSERT
WITH CHECK (is_workspace_owner(workspace_id));
```

## The chicken-and-egg problem

The `tbl_workspace_members` INSERT policy requires `is_workspace_owner(workspace_id)`. But when creating a brand new workspace, no members exist yet — so `is_workspace_owner` returns false and the insert is blocked.

**Solution: SECURITY DEFINER RPC**

```sql
CREATE FUNCTION create_workspace_with_owner(workspace_name TEXT)
RETURNS UUID AS $$
DECLARE new_workspace_id UUID;
BEGIN
    INSERT INTO public.tbl_workspaces (name)
    VALUES (workspace_name)
    RETURNING id INTO new_workspace_id;

    INSERT INTO public.tbl_workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, auth.uid(), 'owner');

    RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

`SECURITY DEFINER` runs the function with the privileges of the function owner (the DB admin), bypassing RLS. The caller is still `auth.uid()` inside the function — so we can use it safely to set the owner.

## Critical rules for SECURITY DEFINER functions

1. Always use fully-qualified table names: `public.tbl_workspaces` not `tbl_workspaces`
   - SECURITY DEFINER functions use a restricted `search_path` that doesn't include `public`
   - Bare table names will throw "relation does not exist"

2. Always validate inputs — the function bypasses RLS, so it's responsible for its own safety

3. Prefer `LANGUAGE plpgsql` for SECURITY DEFINER functions — `LANGUAGE sql` validates table existence at creation time which can cause ordering issues during schema deployment

## Trigger functions

`handle_new_auth_user()` and `create_workspace_for_new_user()` are also SECURITY DEFINER because they fire from triggers (not from a user session). The same rules apply: use `public.` prefix on all table names.

## What NOT to do

- Never use `getSession()` for auth checks — it only reads the cookie without validating with Supabase's server. Use `getUser()`.
- Never expose raw DB errors to the user — they can reveal table structure. Always use friendly toast messages.
- Never call `browserSupabase` in a Server Component — it uses the anon key and relies on browser cookie access. Use `createServerSupabase()` instead.

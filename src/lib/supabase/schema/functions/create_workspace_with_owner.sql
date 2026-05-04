-- ============================================================
-- Function: create_workspace_with_owner
-- Called from the frontend to create a workspace and immediately
-- assign the calling user as owner — runs as SECURITY DEFINER
-- so it bypasses RLS on tbl_workspace_members (which requires
-- being an owner before you can add members, a chicken-and-egg
-- problem when creating a fresh workspace).
-- ============================================================

CREATE OR REPLACE FUNCTION create_workspace_with_owner(workspace_name TEXT)
RETURNS UUID AS $$
DECLARE
    new_workspace_id UUID;
BEGIN
    INSERT INTO public.tbl_workspaces (name)
    VALUES (workspace_name)
    RETURNING id INTO new_workspace_id;

    INSERT INTO public.tbl_workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, auth.uid(), 'owner');

    RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

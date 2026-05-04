-- ============================================================
-- Function: create_workspace_for_new_user
-- Automatically creates a personal workspace for a user
-- immediately after they sign up (INSERT on tbl_users).
-- Names the workspace "[first_name]'s Workspace" and assigns
-- the user as the owner in tbl_workspace_members.
-- Called by the trigger: on_user_created_create_workspace
-- ============================================================

CREATE OR REPLACE FUNCTION create_workspace_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
BEGIN
    -- Create the workspace named after the user
    INSERT INTO public.tbl_workspaces (name)
    VALUES (SPLIT_PART(NEW.first_name, ' ', 1) || '''s Workspace')
    RETURNING id INTO new_workspace_id;

    -- Assign the user as the owner of their new workspace
    INSERT INTO public.tbl_workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, NEW.id, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

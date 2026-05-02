-- ============================================================
-- Function: is_workspace_owner
-- Returns true if the currently logged-in user (auth.uid())
-- is the owner of the given workspace.
-- Used in RLS policies where only owners should be allowed
-- to perform destructive or administrative actions.
-- ============================================================

CREATE OR REPLACE FUNCTION is_workspace_owner(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tbl_workspace_members
    WHERE workspace_id = p_workspace_id
    AND   user_id      = auth.uid()
    AND   role         = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;

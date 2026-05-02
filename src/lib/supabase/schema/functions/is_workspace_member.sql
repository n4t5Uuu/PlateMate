-- ============================================================
-- Function: is_workspace_member
-- Returns true if the currently logged-in user (auth.uid())
-- is a member of the given workspace.
-- Used as a helper in RLS policies to avoid repeating
-- the same subquery across multiple tables.
-- ============================================================

CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tbl_workspace_members
    WHERE workspace_id = p_workspace_id
    AND   user_id      = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

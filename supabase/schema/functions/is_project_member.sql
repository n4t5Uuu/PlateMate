-- ============================================================
-- Function: is_project_member
-- Returns true if the currently logged-in user (auth.uid())
-- is the owner of the project OR is a member in tbl_project_members.
-- Declared as SECURITY DEFINER to bypass RLS checks internally,
-- resolving circular dependency recursion between projects and project_members.
-- ============================================================

CREATE OR REPLACE FUNCTION is_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tbl_projects
    WHERE id = p_project_id
    AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM tbl_project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

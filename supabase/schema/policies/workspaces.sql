-- ============================================================
-- RLS Policies: tbl_workspaces
-- Workspace members can view their workspace.
-- Only the workspace owner can update or delete it.
-- Any authenticated user can create a workspace.
-- ============================================================

ALTER TABLE tbl_workspaces ENABLE ROW LEVEL SECURITY;

-- Allow workspace members to view their workspace
DROP POLICY IF EXISTS "workspaces: members can view" ON tbl_workspaces;
CREATE POLICY "workspaces: members can view"
  ON tbl_workspaces FOR SELECT
  USING (is_workspace_member(id));

-- Allow only the workspace owner to update workspace details
DROP POLICY IF EXISTS "workspaces: owner can update" ON tbl_workspaces;
CREATE POLICY "workspaces: owner can update"
  ON tbl_workspaces FOR UPDATE
  USING (is_workspace_owner(id));

-- Allow only the workspace owner to delete the workspace
DROP POLICY IF EXISTS "workspaces: owner can delete" ON tbl_workspaces;
CREATE POLICY "workspaces: owner can delete"
  ON tbl_workspaces FOR DELETE
  USING (is_workspace_owner(id));

-- Allow any logged-in user to create a workspace
DROP POLICY IF EXISTS "workspaces: authenticated users can create" ON tbl_workspaces;
CREATE POLICY "workspaces: authenticated users can create"
  ON tbl_workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

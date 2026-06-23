-- ============================================================
-- RLS Policies: tbl_project_members
-- Project members can view the member list for their project.
-- Workspace owner OR project owner can add/remove members.
-- ============================================================

ALTER TABLE tbl_project_members ENABLE ROW LEVEL SECURITY;

-- Allow project members to view other members on the same project
DROP POLICY IF EXISTS "project_members: members can view" ON tbl_project_members;
CREATE POLICY "project_members: members can view"
  ON tbl_project_members FOR SELECT
  USING (is_project_member(project_id));

-- Allow workspace owner or project owner to add members
DROP POLICY IF EXISTS "project_members: owner can insert" ON tbl_project_members;
CREATE POLICY "project_members: owner can insert"
  ON tbl_project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
         OR owner_id = auth.uid()
    )
  );

-- Allow workspace owner or project owner to remove members
DROP POLICY IF EXISTS "project_members: owner can delete" ON tbl_project_members;
CREATE POLICY "project_members: owner can delete"
  ON tbl_project_members FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
         OR owner_id = auth.uid()
    )
  );

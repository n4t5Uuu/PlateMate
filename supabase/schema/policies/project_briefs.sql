-- ============================================================
-- RLS Policies: tbl_project_briefs
-- Workspace members can view, create, and edit briefs.
-- Only the workspace owner can delete a brief.
-- ============================================================

ALTER TABLE tbl_project_briefs ENABLE ROW LEVEL SECURITY;

-- Allow project members to view the project brief
DROP POLICY IF EXISTS "project_briefs: members can view" ON tbl_project_briefs;
CREATE POLICY "project_briefs: members can view"
  ON tbl_project_briefs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to create a brief
DROP POLICY IF EXISTS "project_briefs: members can insert" ON tbl_project_briefs;
CREATE POLICY "project_briefs: members can insert"
  ON tbl_project_briefs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update the brief (e.g. re-parse)
DROP POLICY IF EXISTS "project_briefs: members can update" ON tbl_project_briefs;
CREATE POLICY "project_briefs: members can update"
  ON tbl_project_briefs FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Only the workspace owner can permanently delete a brief
DROP POLICY IF EXISTS "project_briefs: owner can delete" ON tbl_project_briefs;
CREATE POLICY "project_briefs: owner can delete"
  ON tbl_project_briefs FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
    )
  );

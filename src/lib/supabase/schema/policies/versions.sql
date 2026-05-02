-- ============================================================
-- RLS Policies: tbl_versions
-- Workspace members can fully manage versions within their projects.
-- ============================================================

ALTER TABLE tbl_versions ENABLE ROW LEVEL SECURITY;

-- Allow project members to view versions
CREATE POLICY "versions: members can view"
  ON tbl_versions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to upload new versions
CREATE POLICY "versions: members can insert"
  ON tbl_versions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update version details
CREATE POLICY "versions: members can update"
  ON tbl_versions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to delete versions
CREATE POLICY "versions: members can delete"
  ON tbl_versions FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

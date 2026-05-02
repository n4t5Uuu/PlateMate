-- ============================================================
-- RLS Policies: tbl_version_annotations
-- Access follows the parent version's project membership.
-- ============================================================

ALTER TABLE tbl_version_annotations ENABLE ROW LEVEL SECURITY;

-- Allow project members to view annotations on their versions
CREATE POLICY "version_annotations: members can view"
  ON tbl_version_annotations FOR SELECT
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add annotations
CREATE POLICY "version_annotations: members can insert"
  ON tbl_version_annotations FOR INSERT
  WITH CHECK (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update annotations
CREATE POLICY "version_annotations: members can update"
  ON tbl_version_annotations FOR UPDATE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to delete annotations
CREATE POLICY "version_annotations: members can delete"
  ON tbl_version_annotations FOR DELETE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

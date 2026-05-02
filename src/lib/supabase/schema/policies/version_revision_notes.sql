-- ============================================================
-- RLS Policies: tbl_version_revision_notes
-- Access follows the parent version's project membership.
-- Only the note author can delete their own notes.
-- ============================================================

ALTER TABLE tbl_version_revision_notes ENABLE ROW LEVEL SECURITY;

-- Allow project members to view revision notes
CREATE POLICY "revision_notes: members can view"
  ON tbl_version_revision_notes FOR SELECT
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add revision notes
CREATE POLICY "revision_notes: members can insert"
  ON tbl_version_revision_notes FOR INSERT
  WITH CHECK (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update revision notes
CREATE POLICY "revision_notes: members can update"
  ON tbl_version_revision_notes FOR UPDATE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Only the author of a note can delete it
CREATE POLICY "revision_notes: author can delete"
  ON tbl_version_revision_notes FOR DELETE
  USING (author_id = auth.uid());

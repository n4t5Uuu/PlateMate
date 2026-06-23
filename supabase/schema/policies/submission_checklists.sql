-- ============================================================
-- RLS Policies: tbl_submission_checklists
-- Workspace members can fully manage submission checklists.
-- ============================================================

ALTER TABLE tbl_submission_checklists ENABLE ROW LEVEL SECURITY;

-- Allow project members to view submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can view" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can view"
  ON tbl_submission_checklists FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to create submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can insert" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can insert"
  ON tbl_submission_checklists FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can update" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can update"
  ON tbl_submission_checklists FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to delete submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can delete" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can delete"
  ON tbl_submission_checklists FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

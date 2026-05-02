-- ============================================================
-- RLS Policies: tbl_checklist_items
-- Access follows the parent checklist's project membership.
-- ============================================================

ALTER TABLE tbl_checklist_items ENABLE ROW LEVEL SECURITY;

-- Allow project members to view checklist items
CREATE POLICY "checklist_items: members can view"
  ON tbl_checklist_items FOR SELECT
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add checklist items
CREATE POLICY "checklist_items: members can insert"
  ON tbl_checklist_items FOR INSERT
  WITH CHECK (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update checklist items (e.g. mark complete)
CREATE POLICY "checklist_items: members can update"
  ON tbl_checklist_items FOR UPDATE
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to delete checklist items
CREATE POLICY "checklist_items: members can delete"
  ON tbl_checklist_items FOR DELETE
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

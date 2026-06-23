-- ============================================================
-- RLS Policies: tbl_subtasks
-- Access follows the parent task's project membership.
-- ============================================================

ALTER TABLE tbl_subtasks ENABLE ROW LEVEL SECURITY;

-- Allow project members to view subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can view" ON tbl_subtasks;
CREATE POLICY "subtasks: members can view"
  ON tbl_subtasks FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to create subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can insert" ON tbl_subtasks;
CREATE POLICY "subtasks: members can insert"
  ON tbl_subtasks FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can update" ON tbl_subtasks;
CREATE POLICY "subtasks: members can update"
  ON tbl_subtasks FOR UPDATE
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to delete subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can delete" ON tbl_subtasks;
CREATE POLICY "subtasks: members can delete"
  ON tbl_subtasks FOR DELETE
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

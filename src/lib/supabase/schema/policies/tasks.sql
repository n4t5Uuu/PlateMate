-- ============================================================
-- RLS Policies: tbl_tasks
-- Workspace members can fully manage tasks within their projects.
-- Access is scoped to projects the user belongs to.
-- ============================================================

ALTER TABLE tbl_tasks ENABLE ROW LEVEL SECURITY;

-- Allow project members to view tasks in their projects
CREATE POLICY "tasks: members can view"
  ON tbl_tasks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to create tasks in their projects
CREATE POLICY "tasks: members can insert"
  ON tbl_tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update tasks in their projects
CREATE POLICY "tasks: members can update"
  ON tbl_tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to delete tasks in their projects
CREATE POLICY "tasks: members can delete"
  ON tbl_tasks FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

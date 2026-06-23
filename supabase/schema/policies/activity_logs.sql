-- ============================================================
-- RLS Policies: tbl_activity_logs
-- Project members can view logs. Members can insert logs.
-- Logs cannot be updated or deleted to preserve audit history.
-- ============================================================

ALTER TABLE tbl_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow project members to view activity logs for their projects
DROP POLICY IF EXISTS "activity_logs: members can view" ON tbl_activity_logs;
CREATE POLICY "activity_logs: members can view"
  ON tbl_activity_logs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to insert activity logs
DROP POLICY IF EXISTS "activity_logs: members can insert" ON tbl_activity_logs;
CREATE POLICY "activity_logs: members can insert"
  ON tbl_activity_logs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

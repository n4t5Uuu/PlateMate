-- ============================================================
-- RLS Policies: tbl_crit_sessions
-- Workspace members can view, create, and update crit sessions.
-- Only the session creator can delete it.
-- ============================================================

ALTER TABLE tbl_crit_sessions ENABLE ROW LEVEL SECURITY;

-- Allow project members to view crit sessions
CREATE POLICY "crit_sessions: members can view"
  ON tbl_crit_sessions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to start a new crit session
CREATE POLICY "crit_sessions: members can insert"
  ON tbl_crit_sessions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update a crit session (e.g. set ended_at)
CREATE POLICY "crit_sessions: members can update"
  ON tbl_crit_sessions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Only the creator of the session can delete it
CREATE POLICY "crit_sessions: creator can delete"
  ON tbl_crit_sessions FOR DELETE
  USING (created_by = auth.uid());

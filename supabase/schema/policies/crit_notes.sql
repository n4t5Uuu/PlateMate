-- ============================================================
-- RLS Policies: tbl_crit_notes
-- Access follows the parent crit session's project membership.
-- Only the note author can delete their own notes.
-- ============================================================

ALTER TABLE tbl_crit_notes ENABLE ROW LEVEL SECURITY;

-- Allow project members to view crit notes in their sessions
DROP POLICY IF EXISTS "crit_notes: members can view" ON tbl_crit_notes;
CREATE POLICY "crit_notes: members can view"
  ON tbl_crit_notes FOR SELECT
  USING (
    session_id IN (
      SELECT cs.id FROM tbl_crit_sessions cs
      JOIN tbl_projects p ON p.id = cs.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add notes during a crit session
DROP POLICY IF EXISTS "crit_notes: members can insert" ON tbl_crit_notes;
CREATE POLICY "crit_notes: members can insert"
  ON tbl_crit_notes FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT cs.id FROM tbl_crit_sessions cs
      JOIN tbl_projects p ON p.id = cs.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update crit notes (e.g. mark actioned)
DROP POLICY IF EXISTS "crit_notes: members can update" ON tbl_crit_notes;
CREATE POLICY "crit_notes: members can update"
  ON tbl_crit_notes FOR UPDATE
  USING (
    session_id IN (
      SELECT cs.id FROM tbl_crit_sessions cs
      JOIN tbl_projects p ON p.id = cs.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Only the author of a note can delete it
DROP POLICY IF EXISTS "crit_notes: author can delete" ON tbl_crit_notes;
CREATE POLICY "crit_notes: author can delete"
  ON tbl_crit_notes FOR DELETE
  USING (author_id = auth.uid());

-- ============================================================
-- RLS Policies: tbl_pinned_projects
-- Users can only manage their own pinned projects.
-- No user can see or modify another user's pinned list.
-- ============================================================

ALTER TABLE tbl_pinned_projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own pinned projects
CREATE POLICY "pinned_projects: view own"
  ON tbl_pinned_projects FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to pin a project for themselves only
CREATE POLICY "pinned_projects: insert own"
  ON tbl_pinned_projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to unpin only their own pinned projects
CREATE POLICY "pinned_projects: delete own"
  ON tbl_pinned_projects FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS Policies: tbl_moodboard_items
-- Workspace members can fully manage moodboard items in their projects.
-- ============================================================

ALTER TABLE tbl_moodboard_items ENABLE ROW LEVEL SECURITY;

-- Allow project members to view moodboard items
DROP POLICY IF EXISTS "moodboard_items: members can view" ON tbl_moodboard_items;
CREATE POLICY "moodboard_items: members can view"
  ON tbl_moodboard_items FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to add moodboard items
DROP POLICY IF EXISTS "moodboard_items: members can insert" ON tbl_moodboard_items;
CREATE POLICY "moodboard_items: members can insert"
  ON tbl_moodboard_items FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update moodboard items (e.g. reposition)
DROP POLICY IF EXISTS "moodboard_items: members can update" ON tbl_moodboard_items;
CREATE POLICY "moodboard_items: members can update"
  ON tbl_moodboard_items FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to remove moodboard items
DROP POLICY IF EXISTS "moodboard_items: members can delete" ON tbl_moodboard_items;
CREATE POLICY "moodboard_items: members can delete"
  ON tbl_moodboard_items FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

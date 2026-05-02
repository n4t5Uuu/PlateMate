-- ============================================================
-- RLS Policies: tbl_workspace_members
-- Members can view other members in their workspace.
-- Only the workspace owner can add or remove members.
-- ============================================================

ALTER TABLE tbl_workspace_members ENABLE ROW LEVEL SECURITY;

-- Allow workspace members to view the full member list
CREATE POLICY "workspace_members: members can view"
  ON tbl_workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Allow only the workspace owner to add new members
CREATE POLICY "workspace_members: owner can insert"
  ON tbl_workspace_members FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

-- Allow only the workspace owner to remove members
CREATE POLICY "workspace_members: owner can delete"
  ON tbl_workspace_members FOR DELETE
  USING (is_workspace_owner(workspace_id));

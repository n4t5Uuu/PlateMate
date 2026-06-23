-- ============================================================
-- RLS Policies: tbl_projects
-- Only the project owner or assigned project members can view a project.
-- Workspace members can create projects.
-- Project members can update. Only workspace owner can delete.
-- ============================================================

ALTER TABLE tbl_projects ENABLE ROW LEVEL SECURITY;

-- Allow project owner and assigned members to view the project
CREATE POLICY "projects: members can view"
  ON tbl_projects FOR SELECT
  USING (is_project_member(id));

-- Allow workspace members to create new projects
CREATE POLICY "projects: members can insert"
  ON tbl_projects FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- Allow project members to update project details
CREATE POLICY "projects: members can update"
  ON tbl_projects FOR UPDATE
  USING (is_workspace_member(workspace_id));

-- Allow only the workspace owner to delete a project
CREATE POLICY "projects: owner can delete"
  ON tbl_projects FOR DELETE
  USING (is_workspace_owner(workspace_id));

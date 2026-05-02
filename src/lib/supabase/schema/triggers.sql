-- ------------------------------------------------------------
-- Auto-update updated_at timestamps
-- Fires before any UPDATE so the updated_at column always
-- reflects the latest modification time.
-- ------------------------------------------------------------

-- Keeps tbl_projects.updated_at current on every project edit
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON tbl_projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keeps tbl_tasks.updated_at current on every task edit
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tbl_tasks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keeps tbl_project_briefs.updated_at current on every brief edit
CREATE TRIGGER update_briefs_updated_at
BEFORE UPDATE ON tbl_project_briefs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keeps tbl_ai_conversations.updated_at current on every message update
CREATE TRIGGER update_ai_convo_updated_at
BEFORE UPDATE ON tbl_ai_conversations
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ------------------------------------------------------------
-- Auto-create workspace on user signup
-- Fires after a new user is inserted into tbl_users.
-- Creates a personal workspace and assigns the user as owner
-- so every user has a workspace without manual setup.
-- ------------------------------------------------------------

-- When a new user signs up, automatically creates a workspace
-- named "[first_name]'s Workspace" and adds them as the owner
CREATE TRIGGER on_user_created_create_workspace
AFTER INSERT ON tbl_users
FOR EACH ROW EXECUTE PROCEDURE create_workspace_for_new_user();

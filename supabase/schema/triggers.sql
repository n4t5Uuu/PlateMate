-- ------------------------------------------------------------
-- Auto-update updated_at timestamps
-- Fires before any UPDATE so the updated_at column always
-- reflects the latest modification time.
-- ------------------------------------------------------------

-- Keeps tbl_projects.updated_at current on every project edit
DROP TRIGGER IF EXISTS update_projects_updated_at ON tbl_projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON tbl_projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keeps tbl_tasks.updated_at current on every task edit
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tbl_tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tbl_tasks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keeps tbl_project_briefs.updated_at current on every brief edit
DROP TRIGGER IF EXISTS update_briefs_updated_at ON tbl_project_briefs;
CREATE TRIGGER update_briefs_updated_at
BEFORE UPDATE ON tbl_project_briefs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Keeps tbl_ai_conversations.updated_at current on every message update
DROP TRIGGER IF EXISTS update_ai_convo_updated_at ON tbl_ai_conversations;
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
DROP TRIGGER IF EXISTS on_user_created_create_workspace ON tbl_users;
CREATE TRIGGER on_user_created_create_workspace
AFTER INSERT ON tbl_users
FOR EACH ROW EXECUTE PROCEDURE create_workspace_for_new_user();

-- ------------------------------------------------------------
-- Sync auth.users to tbl_users on signup
-- Fires after Supabase creates a user in auth.users.
-- Copies id, email, first_name, and last_name into tbl_users,
-- which then triggers on_user_created_create_workspace above.
-- ------------------------------------------------------------

-- Copies auth.users data into tbl_users on every new signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_auth_user();

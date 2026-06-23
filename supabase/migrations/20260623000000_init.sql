-- ============================================================
-- Function: update_updated_at_column
-- Automatically sets updated_at to the current timestamp
-- before any UPDATE on a table.
-- Used by triggers on: tbl_projects, tbl_tasks,
-- tbl_project_briefs, tbl_ai_conversations
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- Function: handle_new_auth_user
-- Fires after a new user is created in auth.users.
-- Copies the user's id, email, first_name, and last_name
-- into tbl_users so the rest of the app can reference them.
-- This also triggers on_user_created_create_workspace.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tbl_users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- Function: create_workspace_for_new_user
-- Automatically creates a personal workspace for a user
-- immediately after they sign up (INSERT on tbl_users).
-- Names the workspace "[first_name]'s Workspace" and assigns
-- the user as the owner in tbl_workspace_members.
-- Called by the trigger: on_user_created_create_workspace
-- ============================================================

CREATE OR REPLACE FUNCTION create_workspace_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
BEGIN
    -- Create the workspace named after the user
    INSERT INTO public.tbl_workspaces (name)
    VALUES (SPLIT_PART(NEW.first_name, ' ', 1) || '''s Workspace')
    RETURNING id INTO new_workspace_id;

    -- Assign the user as the owner of their new workspace
    INSERT INTO public.tbl_workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, NEW.id, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- Function: create_workspace_with_owner
-- Called from the frontend to create a workspace and immediately
-- assign the calling user as owner — runs as SECURITY DEFINER
-- so it bypasses RLS on tbl_workspace_members (which requires
-- being an owner before you can add members, a chicken-and-egg
-- problem when creating a fresh workspace).
-- ============================================================

CREATE OR REPLACE FUNCTION create_workspace_with_owner(workspace_name TEXT)
RETURNS UUID AS $$
DECLARE
    new_workspace_id UUID;
BEGIN
    INSERT INTO public.tbl_workspaces (name)
    VALUES (workspace_name)
    RETURNING id INTO new_workspace_id;

    INSERT INTO public.tbl_workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, auth.uid(), 'owner');

    RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TABLE IF NOT EXISTS tbl_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  avatar_url    TEXT
);

CREATE TABLE IF NOT EXISTS tbl_workspaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  name          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  workspace_id  UUID NOT NULL REFERENCES tbl_workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member'
);

CREATE TABLE IF NOT EXISTS tbl_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  workspace_id  UUID NOT NULL REFERENCES tbl_workspaces(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  client_name   TEXT,
  priority      TEXT DEFAULT 'medium',
  status        TEXT DEFAULT 'active',
  due_date      DATE,
  progress      FLOAT DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tbl_project_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member',
  UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tbl_pinned_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  UNIQUE (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS tbl_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  assigned_to   UUID REFERENCES tbl_users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT DEFAULT 'todo',
  priority      TEXT DEFAULT 'medium',
  due_date      DATE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tbl_subtasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  task_id       UUID NOT NULL REFERENCES tbl_tasks(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  is_completed  BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tbl_activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     UUID
);

CREATE TABLE IF NOT EXISTS tbl_versions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id        UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  version_number    INT NOT NULL,
  label             TEXT,
  notes             TEXT,
  file_url          TEXT,
  file_type         TEXT,
  status            TEXT DEFAULT 'draft',
  branch_name       TEXT,
  parent_version_id UUID,
  UNIQUE (project_id, version_number)
);

CREATE TABLE IF NOT EXISTS tbl_version_annotations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  version_id    UUID NOT NULL REFERENCES tbl_versions(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  pos_x         FLOAT NOT NULL,
  pos_y         FLOAT NOT NULL,
  content       TEXT NOT NULL,
  color         TEXT DEFAULT '#F59E0B',
  status        TEXT DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS tbl_version_revision_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  version_id    UUID NOT NULL REFERENCES tbl_versions(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  feedback_from TEXT,
  note          TEXT NOT NULL,
  is_resolved   BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tbl_moodboard_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  version_id    UUID REFERENCES tbl_versions(id) ON DELETE SET NULL,
  added_by      UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  type          TEXT DEFAULT 'image',
  image_url     TEXT,
  content_url   TEXT,
  caption       TEXT,
  metadata      JSONB,
  pos_x         FLOAT DEFAULT 0,
  pos_y         FLOAT DEFAULT 0,
  width         FLOAT DEFAULT 200,
  height        FLOAT DEFAULT 200,
  rotation      FLOAT DEFAULT 0,
  z_index       INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tbl_project_briefs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id           UUID NOT NULL UNIQUE REFERENCES tbl_projects(id) ON DELETE CASCADE,
  created_by           UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  raw_text             TEXT,
  parsed_requirements  JSONB,
  parsed_constraints   JSONB,
  parsed_deliverables  JSONB,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tbl_submission_checklists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  version_id    UUID REFERENCES tbl_versions(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  due_date      DATE
);

CREATE TABLE IF NOT EXISTS tbl_checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID NOT NULL REFERENCES tbl_submission_checklists(id) ON DELETE CASCADE,
  sheet_type    TEXT NOT NULL,
  scale         TEXT,
  description   TEXT,
  is_completed  BOOLEAN DEFAULT false,
  completed_by  UUID REFERENCES tbl_users(id) ON DELETE SET NULL,
  completed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tbl_crit_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  project_id       UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  version_id       UUID REFERENCES tbl_versions(id) ON DELETE SET NULL,
  created_by       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  duration_seconds INT,
  title            TEXT
);

CREATE TABLE IF NOT EXISTS tbl_crit_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id    UUID NOT NULL REFERENCES tbl_crit_sessions(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  source        TEXT,
  content       TEXT NOT NULL,
  tag           TEXT,
  is_actioned   BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tbl_ai_conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id       UUID REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  title            TEXT,
  messages         JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot JSONB,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_projects_workspace       ON tbl_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project            ON tbl_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task            ON tbl_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_versions_project         ON tbl_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_parent          ON tbl_versions(parent_version_id);
CREATE INDEX IF NOT EXISTS idx_annotations_version      ON tbl_version_annotations(version_id);
CREATE INDEX IF NOT EXISTS idx_revision_notes_version   ON tbl_version_revision_notes(version_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_project        ON tbl_moodboard_items(project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_list     ON tbl_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_crit_notes_session       ON tbl_crit_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project    ON tbl_activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_project ON tbl_ai_conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user    ON tbl_ai_conversations(user_id);


-- ============================================================
-- Function: is_workspace_member
-- Returns true if the currently logged-in user (auth.uid())
-- is a member of the given workspace.
-- Used as a helper in RLS policies to avoid repeating
-- the same subquery across multiple tables.
-- ============================================================

CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tbl_workspace_members
    WHERE workspace_id = p_workspace_id
    AND   user_id      = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- Function: is_workspace_owner
-- Returns true if the currently logged-in user (auth.uid())
-- is the owner of the given workspace.
-- Used in RLS policies where only owners should be allowed
-- to perform destructive or administrative actions.
-- ============================================================

CREATE OR REPLACE FUNCTION is_workspace_owner(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tbl_workspace_members
    WHERE workspace_id = p_workspace_id
    AND   user_id      = auth.uid()
    AND   role         = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- Function: is_project_member
-- Returns true if the currently logged-in user (auth.uid())
-- is the owner of the project OR is a member in tbl_project_members.
-- Declared as SECURITY DEFINER to bypass RLS checks internally,
-- resolving circular dependency recursion between projects and project_members.
-- ============================================================

CREATE OR REPLACE FUNCTION is_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tbl_projects
    WHERE id = p_project_id
    AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM tbl_project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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


-- ============================================================
-- RLS Policies: tbl_users
-- Users can only read, insert, and update their own row.
-- No user can view or modify another user's data.
-- ============================================================

ALTER TABLE tbl_users ENABLE ROW LEVEL SECURITY;

-- Allow a user to read only their own row
DROP POLICY IF EXISTS "users: read own row" ON tbl_users;
CREATE POLICY "users: read own row"
  ON tbl_users FOR SELECT
  USING (id = auth.uid());

-- Allow a user to update only their own row
DROP POLICY IF EXISTS "users: update own row" ON tbl_users;
CREATE POLICY "users: update own row"
  ON tbl_users FOR UPDATE
  USING (id = auth.uid());

-- Allow a user to insert only their own row (id must match the logged-in user)
DROP POLICY IF EXISTS "users: insert own row" ON tbl_users;
CREATE POLICY "users: insert own row"
  ON tbl_users FOR INSERT
  WITH CHECK (id = auth.uid());


-- ============================================================
-- RLS Policies: tbl_workspaces
-- Workspace members can view their workspace.
-- Only the workspace owner can update or delete it.
-- Any authenticated user can create a workspace.
-- ============================================================

ALTER TABLE tbl_workspaces ENABLE ROW LEVEL SECURITY;

-- Allow workspace members to view their workspace
DROP POLICY IF EXISTS "workspaces: members can view" ON tbl_workspaces;
CREATE POLICY "workspaces: members can view"
  ON tbl_workspaces FOR SELECT
  USING (is_workspace_member(id));

-- Allow only the workspace owner to update workspace details
DROP POLICY IF EXISTS "workspaces: owner can update" ON tbl_workspaces;
CREATE POLICY "workspaces: owner can update"
  ON tbl_workspaces FOR UPDATE
  USING (is_workspace_owner(id));

-- Allow only the workspace owner to delete the workspace
DROP POLICY IF EXISTS "workspaces: owner can delete" ON tbl_workspaces;
CREATE POLICY "workspaces: owner can delete"
  ON tbl_workspaces FOR DELETE
  USING (is_workspace_owner(id));

-- Allow any logged-in user to create a workspace
DROP POLICY IF EXISTS "workspaces: authenticated users can create" ON tbl_workspaces;
CREATE POLICY "workspaces: authenticated users can create"
  ON tbl_workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================
-- RLS Policies: tbl_workspace_members
-- Members can view other members in their workspace.
-- Only the workspace owner can add or remove members.
-- ============================================================

ALTER TABLE tbl_workspace_members ENABLE ROW LEVEL SECURITY;

-- Allow workspace members to view the full member list
DROP POLICY IF EXISTS "workspace_members: members can view" ON tbl_workspace_members;
CREATE POLICY "workspace_members: members can view"
  ON tbl_workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id));

-- Allow only the workspace owner to add new members
DROP POLICY IF EXISTS "workspace_members: owner can insert" ON tbl_workspace_members;
CREATE POLICY "workspace_members: owner can insert"
  ON tbl_workspace_members FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

-- Allow only the workspace owner to remove members
DROP POLICY IF EXISTS "workspace_members: owner can delete" ON tbl_workspace_members;
CREATE POLICY "workspace_members: owner can delete"
  ON tbl_workspace_members FOR DELETE
  USING (is_workspace_owner(workspace_id));


-- ============================================================
-- RLS Policies: tbl_projects
-- Only the project owner or assigned project members can view a project.
-- Workspace members can create projects.
-- Project members can update. Only workspace owner can delete.
-- ============================================================

ALTER TABLE tbl_projects ENABLE ROW LEVEL SECURITY;

-- Allow project owner and assigned members to view the project
DROP POLICY IF EXISTS "projects: members can view" ON tbl_projects;
CREATE POLICY "projects: members can view"
  ON tbl_projects FOR SELECT
  USING (is_project_member(id));

-- Allow workspace members to create new projects
DROP POLICY IF EXISTS "projects: members can insert" ON tbl_projects;
CREATE POLICY "projects: members can insert"
  ON tbl_projects FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- Allow project members to update project details
DROP POLICY IF EXISTS "projects: members can update" ON tbl_projects;
CREATE POLICY "projects: members can update"
  ON tbl_projects FOR UPDATE
  USING (is_workspace_member(workspace_id));

-- Allow only the workspace owner to delete a project
DROP POLICY IF EXISTS "projects: owner can delete" ON tbl_projects;
CREATE POLICY "projects: owner can delete"
  ON tbl_projects FOR DELETE
  USING (is_workspace_owner(workspace_id));


-- ============================================================
-- RLS Policies: tbl_project_members
-- Project members can view the member list for their project.
-- Workspace owner OR project owner can add/remove members.
-- ============================================================

ALTER TABLE tbl_project_members ENABLE ROW LEVEL SECURITY;

-- Allow project members to view other members on the same project
DROP POLICY IF EXISTS "project_members: members can view" ON tbl_project_members;
CREATE POLICY "project_members: members can view"
  ON tbl_project_members FOR SELECT
  USING (is_project_member(project_id));

-- Allow workspace owner or project owner to add members
DROP POLICY IF EXISTS "project_members: owner can insert" ON tbl_project_members;
CREATE POLICY "project_members: owner can insert"
  ON tbl_project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
         OR owner_id = auth.uid()
    )
  );

-- Allow workspace owner or project owner to remove members
DROP POLICY IF EXISTS "project_members: owner can delete" ON tbl_project_members;
CREATE POLICY "project_members: owner can delete"
  ON tbl_project_members FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
         OR owner_id = auth.uid()
    )
  );


-- ============================================================
-- RLS Policies: tbl_pinned_projects
-- Users can only manage their own pinned projects.
-- No user can see or modify another user's pinned list.
-- ============================================================

ALTER TABLE tbl_pinned_projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own pinned projects
DROP POLICY IF EXISTS "pinned_projects: view own" ON tbl_pinned_projects;
CREATE POLICY "pinned_projects: view own"
  ON tbl_pinned_projects FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to pin a project for themselves only
DROP POLICY IF EXISTS "pinned_projects: insert own" ON tbl_pinned_projects;
CREATE POLICY "pinned_projects: insert own"
  ON tbl_pinned_projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to unpin only their own pinned projects
DROP POLICY IF EXISTS "pinned_projects: delete own" ON tbl_pinned_projects;
CREATE POLICY "pinned_projects: delete own"
  ON tbl_pinned_projects FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- RLS Policies: tbl_tasks
-- Workspace members can fully manage tasks within their projects.
-- Access is scoped to projects the user belongs to.
-- ============================================================

ALTER TABLE tbl_tasks ENABLE ROW LEVEL SECURITY;

-- Allow project members to view tasks in their projects
DROP POLICY IF EXISTS "tasks: members can view" ON tbl_tasks;
CREATE POLICY "tasks: members can view"
  ON tbl_tasks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to create tasks in their projects
DROP POLICY IF EXISTS "tasks: members can insert" ON tbl_tasks;
CREATE POLICY "tasks: members can insert"
  ON tbl_tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update tasks in their projects
DROP POLICY IF EXISTS "tasks: members can update" ON tbl_tasks;
CREATE POLICY "tasks: members can update"
  ON tbl_tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to delete tasks in their projects
DROP POLICY IF EXISTS "tasks: members can delete" ON tbl_tasks;
CREATE POLICY "tasks: members can delete"
  ON tbl_tasks FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ============================================================
-- RLS Policies: tbl_subtasks
-- Access follows the parent task's project membership.
-- ============================================================

ALTER TABLE tbl_subtasks ENABLE ROW LEVEL SECURITY;

-- Allow project members to view subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can view" ON tbl_subtasks;
CREATE POLICY "subtasks: members can view"
  ON tbl_subtasks FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to create subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can insert" ON tbl_subtasks;
CREATE POLICY "subtasks: members can insert"
  ON tbl_subtasks FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can update" ON tbl_subtasks;
CREATE POLICY "subtasks: members can update"
  ON tbl_subtasks FOR UPDATE
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to delete subtasks under their tasks
DROP POLICY IF EXISTS "subtasks: members can delete" ON tbl_subtasks;
CREATE POLICY "subtasks: members can delete"
  ON tbl_subtasks FOR DELETE
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );


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


-- ============================================================
-- RLS Policies: tbl_versions
-- Workspace members can fully manage versions within their projects.
-- ============================================================

ALTER TABLE tbl_versions ENABLE ROW LEVEL SECURITY;

-- Allow project members to view versions
DROP POLICY IF EXISTS "versions: members can view" ON tbl_versions;
CREATE POLICY "versions: members can view"
  ON tbl_versions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to upload new versions
DROP POLICY IF EXISTS "versions: members can insert" ON tbl_versions;
CREATE POLICY "versions: members can insert"
  ON tbl_versions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update version details
DROP POLICY IF EXISTS "versions: members can update" ON tbl_versions;
CREATE POLICY "versions: members can update"
  ON tbl_versions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to delete versions
DROP POLICY IF EXISTS "versions: members can delete" ON tbl_versions;
CREATE POLICY "versions: members can delete"
  ON tbl_versions FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ============================================================
-- RLS Policies: tbl_version_annotations
-- Access follows the parent version's project membership.
-- ============================================================

ALTER TABLE tbl_version_annotations ENABLE ROW LEVEL SECURITY;

-- Allow project members to view annotations on their versions
DROP POLICY IF EXISTS "version_annotations: members can view" ON tbl_version_annotations;
CREATE POLICY "version_annotations: members can view"
  ON tbl_version_annotations FOR SELECT
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add annotations
DROP POLICY IF EXISTS "version_annotations: members can insert" ON tbl_version_annotations;
CREATE POLICY "version_annotations: members can insert"
  ON tbl_version_annotations FOR INSERT
  WITH CHECK (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update annotations
DROP POLICY IF EXISTS "version_annotations: members can update" ON tbl_version_annotations;
CREATE POLICY "version_annotations: members can update"
  ON tbl_version_annotations FOR UPDATE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to delete annotations
DROP POLICY IF EXISTS "version_annotations: members can delete" ON tbl_version_annotations;
CREATE POLICY "version_annotations: members can delete"
  ON tbl_version_annotations FOR DELETE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );


-- ============================================================
-- RLS Policies: tbl_version_revision_notes
-- Access follows the parent version's project membership.
-- Only the note author can delete their own notes.
-- ============================================================

ALTER TABLE tbl_version_revision_notes ENABLE ROW LEVEL SECURITY;

-- Allow project members to view revision notes
DROP POLICY IF EXISTS "revision_notes: members can view" ON tbl_version_revision_notes;
CREATE POLICY "revision_notes: members can view"
  ON tbl_version_revision_notes FOR SELECT
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add revision notes
DROP POLICY IF EXISTS "revision_notes: members can insert" ON tbl_version_revision_notes;
CREATE POLICY "revision_notes: members can insert"
  ON tbl_version_revision_notes FOR INSERT
  WITH CHECK (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update revision notes
DROP POLICY IF EXISTS "revision_notes: members can update" ON tbl_version_revision_notes;
CREATE POLICY "revision_notes: members can update"
  ON tbl_version_revision_notes FOR UPDATE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Only the author of a note can delete it
DROP POLICY IF EXISTS "revision_notes: author can delete" ON tbl_version_revision_notes;
CREATE POLICY "revision_notes: author can delete"
  ON tbl_version_revision_notes FOR DELETE
  USING (author_id = auth.uid());


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


-- ============================================================
-- RLS Policies: tbl_project_briefs
-- Workspace members can view, create, and edit briefs.
-- Only the workspace owner can delete a brief.
-- ============================================================

ALTER TABLE tbl_project_briefs ENABLE ROW LEVEL SECURITY;

-- Allow project members to view the project brief
DROP POLICY IF EXISTS "project_briefs: members can view" ON tbl_project_briefs;
CREATE POLICY "project_briefs: members can view"
  ON tbl_project_briefs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to create a brief
DROP POLICY IF EXISTS "project_briefs: members can insert" ON tbl_project_briefs;
CREATE POLICY "project_briefs: members can insert"
  ON tbl_project_briefs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update the brief (e.g. re-parse)
DROP POLICY IF EXISTS "project_briefs: members can update" ON tbl_project_briefs;
CREATE POLICY "project_briefs: members can update"
  ON tbl_project_briefs FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Only the workspace owner can permanently delete a brief
DROP POLICY IF EXISTS "project_briefs: owner can delete" ON tbl_project_briefs;
CREATE POLICY "project_briefs: owner can delete"
  ON tbl_project_briefs FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
    )
  );


-- ============================================================
-- RLS Policies: tbl_submission_checklists
-- Workspace members can fully manage submission checklists.
-- ============================================================

ALTER TABLE tbl_submission_checklists ENABLE ROW LEVEL SECURITY;

-- Allow project members to view submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can view" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can view"
  ON tbl_submission_checklists FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to create submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can insert" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can insert"
  ON tbl_submission_checklists FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can update" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can update"
  ON tbl_submission_checklists FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to delete submission checklists
DROP POLICY IF EXISTS "submission_checklists: members can delete" ON tbl_submission_checklists;
CREATE POLICY "submission_checklists: members can delete"
  ON tbl_submission_checklists FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ============================================================
-- RLS Policies: tbl_checklist_items
-- Access follows the parent checklist's project membership.
-- ============================================================

ALTER TABLE tbl_checklist_items ENABLE ROW LEVEL SECURITY;

-- Allow project members to view checklist items
DROP POLICY IF EXISTS "checklist_items: members can view" ON tbl_checklist_items;
CREATE POLICY "checklist_items: members can view"
  ON tbl_checklist_items FOR SELECT
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to add checklist items
DROP POLICY IF EXISTS "checklist_items: members can insert" ON tbl_checklist_items;
CREATE POLICY "checklist_items: members can insert"
  ON tbl_checklist_items FOR INSERT
  WITH CHECK (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to update checklist items (e.g. mark complete)
DROP POLICY IF EXISTS "checklist_items: members can update" ON tbl_checklist_items;
CREATE POLICY "checklist_items: members can update"
  ON tbl_checklist_items FOR UPDATE
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

-- Allow project members to delete checklist items
DROP POLICY IF EXISTS "checklist_items: members can delete" ON tbl_checklist_items;
CREATE POLICY "checklist_items: members can delete"
  ON tbl_checklist_items FOR DELETE
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );


-- ============================================================
-- RLS Policies: tbl_crit_sessions
-- Workspace members can view, create, and update crit sessions.
-- Only the session creator can delete it.
-- ============================================================

ALTER TABLE tbl_crit_sessions ENABLE ROW LEVEL SECURITY;

-- Allow project members to view crit sessions
DROP POLICY IF EXISTS "crit_sessions: members can view" ON tbl_crit_sessions;
CREATE POLICY "crit_sessions: members can view"
  ON tbl_crit_sessions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to start a new crit session
DROP POLICY IF EXISTS "crit_sessions: members can insert" ON tbl_crit_sessions;
CREATE POLICY "crit_sessions: members can insert"
  ON tbl_crit_sessions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Allow project members to update a crit session (e.g. set ended_at)
DROP POLICY IF EXISTS "crit_sessions: members can update" ON tbl_crit_sessions;
CREATE POLICY "crit_sessions: members can update"
  ON tbl_crit_sessions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

-- Only the creator of the session can delete it
DROP POLICY IF EXISTS "crit_sessions: creator can delete" ON tbl_crit_sessions;
CREATE POLICY "crit_sessions: creator can delete"
  ON tbl_crit_sessions FOR DELETE
  USING (created_by = auth.uid());


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


-- ============================================================
-- RLS Policies: tbl_ai_conversations
-- Users can only access their own AI conversations.
-- No one else can view, edit, or delete another user's conversations.
-- ============================================================

ALTER TABLE tbl_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own conversations
DROP POLICY IF EXISTS "ai_conversations: view own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: view own"
  ON tbl_ai_conversations FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to create conversations only for themselves
DROP POLICY IF EXISTS "ai_conversations: insert own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: insert own"
  ON tbl_ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own conversations
DROP POLICY IF EXISTS "ai_conversations: update own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: update own"
  ON tbl_ai_conversations FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to delete only their own conversations
DROP POLICY IF EXISTS "ai_conversations: delete own" ON tbl_ai_conversations;
CREATE POLICY "ai_conversations: delete own"
  ON tbl_ai_conversations FOR DELETE
  USING (user_id = auth.uid());

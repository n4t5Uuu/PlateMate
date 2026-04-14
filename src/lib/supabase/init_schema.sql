-- ============================================================
-- PlateMate - Full Reset, Rebuild & RLS
-- WARNING: This drops ALL tables and recreates them from scratch
-- ALL DATA WILL BE LOST — only run this if something went wrong
-- ============================================================


-- ============================================================
-- STEP 1: DROP ALL TABLES
-- Order matters — child tables must be dropped before parents
-- ============================================================

DROP TABLE IF EXISTS tbl_crit_notes                CASCADE;
DROP TABLE IF EXISTS tbl_crit_sessions             CASCADE;
DROP TABLE IF EXISTS tbl_checklist_items           CASCADE;
DROP TABLE IF EXISTS tbl_submission_checklists     CASCADE;
DROP TABLE IF EXISTS tbl_project_briefs            CASCADE;
DROP TABLE IF EXISTS tbl_moodboard_items           CASCADE;
DROP TABLE IF EXISTS tbl_version_annotations       CASCADE;
DROP TABLE IF EXISTS tbl_version_revision_notes    CASCADE;
DROP TABLE IF EXISTS tbl_versions                  CASCADE;
DROP TABLE IF EXISTS tbl_ai_conversations          CASCADE;
DROP TABLE IF EXISTS tbl_activity_logs             CASCADE;
DROP TABLE IF EXISTS tbl_subtasks                  CASCADE;
DROP TABLE IF EXISTS tbl_tasks                     CASCADE;
DROP TABLE IF EXISTS tbl_pinned_projects           CASCADE;
DROP TABLE IF EXISTS tbl_project_members           CASCADE;
DROP TABLE IF EXISTS tbl_projects                  CASCADE;
DROP TABLE IF EXISTS tbl_workspace_members         CASCADE;
DROP TABLE IF EXISTS tbl_workspaces                CASCADE;
DROP TABLE IF EXISTS tbl_users                     CASCADE;


-- ============================================================
-- STEP 2: RECREATE ALL TABLES
-- ============================================================


-- Helper Function for Automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- ------------------------------------------------------------
-- CORE: USERS & WORKSPACES
-- ------------------------------------------------------------

CREATE TABLE tbl_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  avatar_url    TEXT
);

CREATE TABLE tbl_workspaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  name          TEXT NOT NULL
);

CREATE TABLE tbl_workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  workspace_id  UUID NOT NULL REFERENCES tbl_workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' -- 'owner' | 'member' | 'viewer'
);


-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------

CREATE TABLE tbl_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  workspace_id  UUID NOT NULL REFERENCES tbl_workspaces(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  client_name   TEXT,
  priority      TEXT DEFAULT 'medium',
  status        TEXT DEFAULT 'active',
  due_date      DATE,
  progress      FLOAT DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tbl_project_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE tbl_pinned_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  UNIQUE (user_id, project_id)
);


-- ------------------------------------------------------------
-- TASKS & SUBTASKS
-- ------------------------------------------------------------

CREATE TABLE tbl_tasks (
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

CREATE TABLE tbl_subtasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  task_id       UUID NOT NULL REFERENCES tbl_tasks(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  is_completed  BOOLEAN DEFAULT false
);


-- ------------------------------------------------------------
-- ACTIVITY LOGS
-- ------------------------------------------------------------

CREATE TABLE tbl_activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     UUID
);


-- ------------------------------------------------------------
-- VERSION CONTROL
-- ------------------------------------------------------------

CREATE TABLE tbl_versions (
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

ALTER TABLE tbl_versions
  ADD CONSTRAINT fk_versions_parent
  FOREIGN KEY (parent_version_id)
  REFERENCES tbl_versions(id)
  ON DELETE SET NULL;

CREATE TABLE tbl_version_annotations (
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

CREATE TABLE tbl_version_revision_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  version_id    UUID NOT NULL REFERENCES tbl_versions(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  feedback_from TEXT,
  note          TEXT NOT NULL,
  is_resolved   BOOLEAN DEFAULT false
);


-- ------------------------------------------------------------
-- MOOD BOARD
-- ------------------------------------------------------------

CREATE TABLE tbl_moodboard_items (
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


-- ------------------------------------------------------------
-- PROJECT BRIEF PARSER
-- ------------------------------------------------------------

CREATE TABLE tbl_project_briefs (
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


-- ------------------------------------------------------------
-- SUBMISSION CHECKLISTS
-- ------------------------------------------------------------

CREATE TABLE tbl_submission_checklists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  version_id    UUID REFERENCES tbl_versions(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  due_date      DATE
);

CREATE TABLE tbl_checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID NOT NULL REFERENCES tbl_submission_checklists(id) ON DELETE CASCADE,
  sheet_type    TEXT NOT NULL,
  scale         TEXT,
  description   TEXT,
  is_completed  BOOLEAN DEFAULT false,
  completed_by  UUID REFERENCES tbl_users(id) ON DELETE SET NULL,
  completed_at  TIMESTAMPTZ
);


-- ------------------------------------------------------------
-- CRIT SESSIONS & NOTES
-- ------------------------------------------------------------

CREATE TABLE tbl_crit_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  project_id       UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  version_id       UUID REFERENCES tbl_versions(id) ON DELETE SET NULL,
  created_by       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  duration_seconds INT,
  title            TEXT
);

CREATE TABLE tbl_crit_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id    UUID NOT NULL REFERENCES tbl_crit_sessions(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  source        TEXT,
  content       TEXT NOT NULL,
  tag           TEXT,
  is_actioned   BOOLEAN DEFAULT false
);


-- ------------------------------------------------------------
-- AI CONVERSATIONS
-- ------------------------------------------------------------

CREATE TABLE tbl_ai_conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id       UUID REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  title            TEXT,
  messages         JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot JSONB,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- STEP 3: AUTOMATIC TIMESTAMPS (TRIGGERS)
-- ------------------------------------------------------------

CREATE TRIGGER update_projects_updated_at 
BEFORE UPDATE ON tbl_projects 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
BEFORE UPDATE ON tbl_tasks 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_briefs_updated_at 
BEFORE UPDATE ON tbl_project_briefs 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_convo_updated_at 
BEFORE UPDATE ON tbl_ai_conversations 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- STEP 4: INDEXES
-- ============================================================

CREATE INDEX idx_projects_workspace       ON tbl_projects(workspace_id);
CREATE INDEX idx_tasks_project            ON tbl_tasks(project_id);
CREATE INDEX idx_subtasks_task            ON tbl_subtasks(task_id);
CREATE INDEX idx_versions_project         ON tbl_versions(project_id);
CREATE INDEX idx_versions_parent          ON tbl_versions(parent_version_id);
CREATE INDEX idx_annotations_version      ON tbl_version_annotations(version_id);
CREATE INDEX idx_revision_notes_version   ON tbl_version_revision_notes(version_id);
CREATE INDEX idx_moodboard_project        ON tbl_moodboard_items(project_id);
CREATE INDEX idx_checklist_items_list     ON tbl_checklist_items(checklist_id);
CREATE INDEX idx_crit_notes_session       ON tbl_crit_notes(session_id);
CREATE INDEX idx_activity_logs_project    ON tbl_activity_logs(project_id);
CREATE INDEX idx_ai_conversations_project ON tbl_ai_conversations(project_id);
CREATE INDEX idx_ai_conversations_user    ON tbl_ai_conversations(user_id);


-- ============================================================
-- STEP 5: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE tbl_users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_workspaces             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_workspace_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_project_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_pinned_projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_subtasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_activity_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_versions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_version_annotations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_version_revision_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_moodboard_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_project_briefs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_submission_checklists  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_checklist_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_crit_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_crit_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_ai_conversations       ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 6: RLS POLICIES
-- Pattern: workspace members can access everything inside
-- their workspace. Users can only access their own personal rows.
-- ============================================================


-- ------------------------------------------------------------
-- HELPER: reusable subquery to check workspace membership
-- Used inside policies to avoid repeating the same join
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tbl_workspace_members
    WHERE workspace_id = p_workspace_id
    AND   user_id      = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_workspace_owner(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tbl_workspace_members
    WHERE workspace_id = p_workspace_id
    AND   user_id      = auth.uid()
    AND   role         = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ------------------------------------------------------------
-- tbl_users
-- Users can only read and update their own row
-- ------------------------------------------------------------

CREATE POLICY "users: read own row"
  ON tbl_users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users: update own row"
  ON tbl_users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "users: insert own row"
  ON tbl_users FOR INSERT
  WITH CHECK (id = auth.uid());


-- ------------------------------------------------------------
-- tbl_workspaces
-- Members can view their workspace. Only owner can update/delete.
-- ------------------------------------------------------------

CREATE POLICY "workspaces: members can view"
  ON tbl_workspaces FOR SELECT
  USING (is_workspace_member(id));

CREATE POLICY "workspaces: owner can update"
  ON tbl_workspaces FOR UPDATE
  USING (is_workspace_owner(id));

CREATE POLICY "workspaces: owner can delete"
  ON tbl_workspaces FOR DELETE
  USING (is_workspace_owner(id));

CREATE POLICY "workspaces: authenticated users can create"
  ON tbl_workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ------------------------------------------------------------
-- tbl_workspace_members
-- Members can view other members in their workspace.
-- Only owner can add or remove members.
-- ------------------------------------------------------------

CREATE POLICY "workspace_members: members can view"
  ON tbl_workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members: owner can insert"
  ON tbl_workspace_members FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "workspace_members: owner can delete"
  ON tbl_workspace_members FOR DELETE
  USING (is_workspace_owner(workspace_id));


-- ------------------------------------------------------------
-- tbl_projects
-- Workspace members can view and edit projects.
-- Only owner can delete.
-- ------------------------------------------------------------

CREATE POLICY "projects: members can view"
  ON tbl_projects FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "projects: members can insert"
  ON tbl_projects FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "projects: members can update"
  ON tbl_projects FOR UPDATE
  USING (is_workspace_member(workspace_id));

CREATE POLICY "projects: owner can delete"
  ON tbl_projects FOR DELETE
  USING (is_workspace_owner(workspace_id));


-- ------------------------------------------------------------
-- tbl_project_members
-- Workspace members can view project members.
-- Only workspace owner can add/remove.
-- ------------------------------------------------------------

CREATE POLICY "project_members: members can view"
  ON tbl_project_members FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "project_members: owner can insert"
  ON tbl_project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
    )
  );

CREATE POLICY "project_members: owner can delete"
  ON tbl_project_members FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_pinned_projects
-- Users can only manage their own pinned projects
-- ------------------------------------------------------------

CREATE POLICY "pinned_projects: view own"
  ON tbl_pinned_projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "pinned_projects: insert own"
  ON tbl_pinned_projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pinned_projects: delete own"
  ON tbl_pinned_projects FOR DELETE
  USING (user_id = auth.uid());


-- ------------------------------------------------------------
-- tbl_tasks
-- Workspace members can fully manage tasks in their projects
-- ------------------------------------------------------------

CREATE POLICY "tasks: members can view"
  ON tbl_tasks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "tasks: members can insert"
  ON tbl_tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "tasks: members can update"
  ON tbl_tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "tasks: members can delete"
  ON tbl_tasks FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_subtasks
-- Access follows the parent task
-- ------------------------------------------------------------

CREATE POLICY "subtasks: members can view"
  ON tbl_subtasks FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "subtasks: members can insert"
  ON tbl_subtasks FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "subtasks: members can update"
  ON tbl_subtasks FOR UPDATE
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "subtasks: members can delete"
  ON tbl_subtasks FOR DELETE
  USING (
    task_id IN (
      SELECT t.id FROM tbl_tasks t
      JOIN tbl_projects p ON p.id = t.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_activity_logs
-- Members can view logs. Logs are inserted by the system only.
-- ------------------------------------------------------------

CREATE POLICY "activity_logs: members can view"
  ON tbl_activity_logs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "activity_logs: members can insert"
  ON tbl_activity_logs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_versions
-- Workspace members can fully manage versions
-- ------------------------------------------------------------

CREATE POLICY "versions: members can view"
  ON tbl_versions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "versions: members can insert"
  ON tbl_versions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "versions: members can update"
  ON tbl_versions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "versions: members can delete"
  ON tbl_versions FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_version_annotations
-- Access follows the parent version
-- ------------------------------------------------------------

CREATE POLICY "version_annotations: members can view"
  ON tbl_version_annotations FOR SELECT
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "version_annotations: members can insert"
  ON tbl_version_annotations FOR INSERT
  WITH CHECK (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "version_annotations: members can update"
  ON tbl_version_annotations FOR UPDATE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "version_annotations: members can delete"
  ON tbl_version_annotations FOR DELETE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_version_revision_notes
-- Access follows the parent version
-- ------------------------------------------------------------

CREATE POLICY "revision_notes: members can view"
  ON tbl_version_revision_notes FOR SELECT
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "revision_notes: members can insert"
  ON tbl_version_revision_notes FOR INSERT
  WITH CHECK (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "revision_notes: members can update"
  ON tbl_version_revision_notes FOR UPDATE
  USING (
    version_id IN (
      SELECT v.id FROM tbl_versions v
      JOIN tbl_projects p ON p.id = v.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "revision_notes: author can delete"
  ON tbl_version_revision_notes FOR DELETE
  USING (author_id = auth.uid());


-- ------------------------------------------------------------
-- tbl_moodboard_items
-- Workspace members can fully manage moodboard items
-- ------------------------------------------------------------

CREATE POLICY "moodboard_items: members can view"
  ON tbl_moodboard_items FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "moodboard_items: members can insert"
  ON tbl_moodboard_items FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "moodboard_items: members can update"
  ON tbl_moodboard_items FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "moodboard_items: members can delete"
  ON tbl_moodboard_items FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_project_briefs
-- Workspace members can view and edit. Only owner can delete.
-- ------------------------------------------------------------

CREATE POLICY "project_briefs: members can view"
  ON tbl_project_briefs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "project_briefs: members can insert"
  ON tbl_project_briefs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "project_briefs: members can update"
  ON tbl_project_briefs FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "project_briefs: owner can delete"
  ON tbl_project_briefs FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_owner(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_submission_checklists
-- Workspace members can fully manage checklists
-- ------------------------------------------------------------

CREATE POLICY "submission_checklists: members can view"
  ON tbl_submission_checklists FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "submission_checklists: members can insert"
  ON tbl_submission_checklists FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "submission_checklists: members can update"
  ON tbl_submission_checklists FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "submission_checklists: members can delete"
  ON tbl_submission_checklists FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_checklist_items
-- Access follows the parent checklist
-- ------------------------------------------------------------

CREATE POLICY "checklist_items: members can view"
  ON tbl_checklist_items FOR SELECT
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "checklist_items: members can insert"
  ON tbl_checklist_items FOR INSERT
  WITH CHECK (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "checklist_items: members can update"
  ON tbl_checklist_items FOR UPDATE
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "checklist_items: members can delete"
  ON tbl_checklist_items FOR DELETE
  USING (
    checklist_id IN (
      SELECT sc.id FROM tbl_submission_checklists sc
      JOIN tbl_projects p ON p.id = sc.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );


-- ------------------------------------------------------------
-- tbl_crit_sessions
-- Workspace members can fully manage crit sessions
-- ------------------------------------------------------------

CREATE POLICY "crit_sessions: members can view"
  ON tbl_crit_sessions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "crit_sessions: members can insert"
  ON tbl_crit_sessions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "crit_sessions: members can update"
  ON tbl_crit_sessions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM tbl_projects
      WHERE is_workspace_member(workspace_id)
    )
  );

CREATE POLICY "crit_sessions: creator can delete"
  ON tbl_crit_sessions FOR DELETE
  USING (created_by = auth.uid());


-- ------------------------------------------------------------
-- tbl_crit_notes
-- Access follows the parent crit session
-- ------------------------------------------------------------

CREATE POLICY "crit_notes: members can view"
  ON tbl_crit_notes FOR SELECT
  USING (
    session_id IN (
      SELECT cs.id FROM tbl_crit_sessions cs
      JOIN tbl_projects p ON p.id = cs.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "crit_notes: members can insert"
  ON tbl_crit_notes FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT cs.id FROM tbl_crit_sessions cs
      JOIN tbl_projects p ON p.id = cs.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "crit_notes: members can update"
  ON tbl_crit_notes FOR UPDATE
  USING (
    session_id IN (
      SELECT cs.id FROM tbl_crit_sessions cs
      JOIN tbl_projects p ON p.id = cs.project_id
      WHERE is_workspace_member(p.workspace_id)
    )
  );

CREATE POLICY "crit_notes: author can delete"
  ON tbl_crit_notes FOR DELETE
  USING (author_id = auth.uid());


-- ------------------------------------------------------------
-- tbl_ai_conversations
-- Users can only access their own conversations
-- ------------------------------------------------------------

CREATE POLICY "ai_conversations: view own"
  ON tbl_ai_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ai_conversations: insert own"
  ON tbl_ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_conversations: update own"
  ON tbl_ai_conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "ai_conversations: delete own"
  ON tbl_ai_conversations FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- END OF RESET, REBUILD & RLS
-- ============================================================
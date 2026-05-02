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
  role          TEXT NOT NULL DEFAULT 'member'
);

CREATE TABLE tbl_projects (
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

CREATE TABLE tbl_project_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member',
  UNIQUE (project_id, user_id)
);

CREATE TABLE tbl_pinned_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  UNIQUE (user_id, project_id)
);

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

CREATE TABLE tbl_activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     UUID
);

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

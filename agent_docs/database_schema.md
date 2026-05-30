# Database Schema

All tables are prefixed with `tbl_`. RLS is enabled on all tables.

## Core Tables

### tbl_users
Mirrors `auth.users`. Populated automatically on signup via `on_auth_user_created` trigger.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Same UUID as auth.users.id |
| first_name | TEXT NOT NULL | |
| last_name | TEXT NOT NULL | |
| email | TEXT NOT NULL UNIQUE | |
| avatar_url | TEXT | nullable |
| created_at | TIMESTAMPTZ | |

### tbl_workspaces
An organization/group that contains projects and members.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | e.g. "Alden's Workspace" |
| created_at | TIMESTAMPTZ | |

### tbl_workspace_members
Junction table — links users to workspaces with a role.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| workspace_id | UUID FK → tbl_workspaces | CASCADE delete |
| user_id | UUID FK → tbl_users | CASCADE delete |
| role | TEXT NOT NULL | 'owner' or 'member' |
| joined_at | TIMESTAMPTZ | |

### tbl_projects
An architectural project inside a workspace.
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| workspace_id | UUID FK → tbl_workspaces | CASCADE delete |
| owner_id | UUID FK → tbl_users | NOT NULL (⚠ contradicts ON DELETE SET NULL) |
| name | TEXT NOT NULL | |
| description | TEXT | nullable |
| client_name | TEXT | nullable |
| priority | TEXT | 'low', 'medium', 'high' |
| status | TEXT | 'active', 'review', 'completed', 'delayed' |
| due_date | DATE | nullable |
| progress | FLOAT | 0–100 |
| updated_at | TIMESTAMPTZ | auto-updated by trigger |

## Project Sub-tables

- **tbl_tasks** — tasks within a project (title, status, priority, assigned_to, due_date)
- **tbl_subtasks** — sub-items within a task
- **tbl_project_members** — users assigned to a project
- **tbl_pinned_projects** — user's pinned projects (per-user)
- **tbl_activity_logs** — audit log of actions on a project
- **tbl_versions** — file/design versions for a project
- **tbl_version_annotations** — pin annotations on a version
- **tbl_version_revision_notes** — revision feedback on a version
- **tbl_moodboard_items** — images/links on a project moodboard
- **tbl_project_briefs** — AI-parsed project brief (requirements, constraints, deliverables)
- **tbl_submission_checklists** — submission checklist for a project version
- **tbl_checklist_items** — individual items in a checklist
- **tbl_crit_sessions** — design critique sessions
- **tbl_crit_notes** — notes captured during a crit session
- **tbl_ai_conversations** — AI chat history per project

## Triggers

| Trigger | Table | Fires | Calls |
|---------|-------|-------|-------|
| on_auth_user_created | auth.users | AFTER INSERT | handle_new_auth_user() |
| on_user_created_create_workspace | tbl_users | AFTER INSERT | create_workspace_for_new_user() |
| update_projects_updated_at | tbl_projects | BEFORE UPDATE | update_updated_at_column() |
| update_tasks_updated_at | tbl_tasks | BEFORE UPDATE | update_updated_at_column() |
| update_briefs_updated_at | tbl_project_briefs | BEFORE UPDATE | update_updated_at_column() |
| update_ai_convo_updated_at | tbl_ai_conversations | BEFORE UPDATE | update_updated_at_column() |

## Key Functions

| Function | Type | Purpose |
|----------|------|---------|
| handle_new_auth_user() | TRIGGER, SECURITY DEFINER | Copies auth signup data to tbl_users |
| create_workspace_for_new_user() | TRIGGER, SECURITY DEFINER | Creates default workspace on signup |
| create_workspace_with_owner(name) | RPC, SECURITY DEFINER | Creates workspace + adds caller as owner (used by frontend) |
| is_workspace_member(workspace_id) | BOOLEAN | Used in RLS policies |
| is_workspace_owner(workspace_id) | BOOLEAN | Used in RLS policies |
| update_updated_at_column() | TRIGGER | Updates updated_at on any table |

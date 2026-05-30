# Projects

## What it is

A project lives inside a workspace and represents one architectural job — a housing development, an interior renovation, a studio plate. It has a status, priority, due date, and progress tracking.

## Project Fields

| Field | Values | Notes |
|-------|--------|-------|
| name | text | Required |
| description | text | Optional summary |
| client_name | text | Who the project is for |
| priority | low / medium / high | Shown as colored badge |
| status | active / review / completed / delayed | Drives card color and pulse indicator |
| due_date | date | Used for calendar and deadline tracking |
| progress | 0–100 | Float, drives progress bar on card |
| workspace_id | UUID | Which workspace owns this project |
| owner_id | UUID | Who created / is responsible |

## Status Meanings

- **Active** — currently being worked on
- **Review** — submitted for critique or client review
- **Completed** — done, signed off
- **Delayed** — behind schedule, needs attention

## Dashboard View

The dashboard shows project cards in a grid. Each card has:
- Project name + description
- Priority badge + status badge
- Progress bar
- Due date
- Flat footer row with metadata (tasks done, members, etc.)

## Current State

The dashboard currently displays sample/hardcoded project data. Real DB integration for projects is the next major milestone.

What needs to happen:
1. `project-helper.ts` — `getProjects(workspaceId)` + `createProject()`
2. `use-projects.ts` — hook that calls the helper
3. Wire dashboard `page.tsx` to fetch real projects
4. Wire `NewProjectDialog` to actually create DB records
5. Build `/projects` list page
6. Build `/projects/[id]` detail page

## Sub-features (planned)

Each project will eventually have:
- **Tasks** — to-do items with status, priority, assignee
- **Plate Versions** — the core differentiator (see [versioning.md](versioning.md))
- **Moodboard** — inspiration images and references
- **Project Brief** — AI-parsed requirements, constraints, deliverables
- **Submission Checklist** — per-version checklist for plate submissions
- **Crit Sessions** — design critique session records with notes
- **Activity Log** — audit trail of all changes

## Known Issues

- `owner_id NOT NULL` on `tbl_projects` contradicts `ON DELETE SET NULL` on the FK — needs fixing before delete flows are built

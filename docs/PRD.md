# PlateMate PRD

Nov 20, 2026 · @Alden

PlateMate is a workspace where architecture students and firms track every revision of their plates, compare versions side by side, and mark up what needs to change. It works like git for drawings: every upload is a version, design options are branches, and crits leave notes pinned to the exact spot on the plate.

## Problem and solution

Architectural plates go through dozens of revisions, and the history ends up scattered across files named `final_v3_REAL.pdf`, chat threads and printed crit markups. Nobody can quickly answer what changed between two versions, which comments were addressed, or which design option was chosen and why.

PlateMate keeps every plate in one place with a full version history:

- **Versions:** every upload is saved as a new version; nothing is overwritten.
- **Branches:** alternative design options are branched off any version and either promoted to the main line or archived.
- **Compare:** any two versions can be viewed side by side, with a swipe slider, as an overlay, or as a pixel diff.
- **Annotations:** reviewers pin comments to an exact spot on a plate and mark them resolved when the revision is done.
- **Crits:** crit sessions collect notes, a meeting link and the versions that were reviewed.
- **Workspaces:** solo users and firms get private workspaces with role-based access, so only invited members see a project.

## Goals and non-goals

The first release succeeds if a student or a small firm can run a full revision cycle in PlateMate: upload, crit, annotate, revise, compare.

**Goals**

1. Track every version of a plate, with who uploaded it, when, and a short change note.
2. Let users explore design options as branches and promote the chosen one.
3. Make the difference between two versions visible at a glance.
4. Pin feedback to an exact spot on a plate and track it to resolved.
5. Keep projects private to invited members, with clear roles.
6. Work for one student alone and for a firm with many members, using the same product.

**Non-goals**

1. Editing drawings. PlateMate displays plates; users keep drawing in AutoCAD, Revit, Rhino, SketchUp or Photoshop.
2. Merging two files into one. Branches are promoted, never merged pixel by pixel.
3. Replacing a CAD file manager or a BIM platform.
4. Native rendering of Revit or 3D model files in the first release.

## Users

PlateMate serves two markets with one product: architecture students in solo workspaces and architecture firms in shared workspaces.

| User | Where they work | What they need most |
| --- | --- | --- |
| Architecture student | Solo workspace, or a class workspace | A clean history of every plate revision for crits and portfolio |
| Instructor or crit juror | Class workspace, invited to student projects | Pin feedback on plates and check whether it was addressed |
| Firm principal or admin | Firm workspace | Control who sees which project; add and remove members |
| Project architect (project head) | Firm workspace, owns a project | Run revisions, set project settings, invite the team |
| Designer or junior architect | Firm workspace, member of projects | Upload new versions, respond to annotations, try design options |
| Client (later) | Guest access to one project | View selected versions and leave comments |

## Core concepts

A workspace holds projects, a project holds plates, and each plate has its own version history.

| Concept | What it is | Git equivalent |
| --- | --- | --- |
| Workspace | A solo space or a firm; owns members, roles and projects | Organization |
| Project | One design job, with client details, members and settings | Repository |
| Plate | One sheet or board, such as "Ground floor plan" or "Site analysis" | A file |
| Version | One uploaded file of a plate, with a change note; never overwritten | Commit |
| Branch | A line of versions for one design option, started from any version | Branch |
| Main | The plate's accepted line of versions | Main branch |
| Promote | Making a branch the new main line; the old line stays in history | Merge (simplified) |
| Annotation | A shape pinned to a spot on one version, with a comment thread and a status | Review comment |
| Crit session | A scheduled review with a meeting link, notes and the versions reviewed | Pull request review |
| Archive | A project or plate hidden from lists and permanently deleted after a waiting period | None |

## Versioning model

Branches replace merging: a design option grows on its own branch, and promoting it makes its latest version the next version on main.

_[Diagram not included in this copy: versioning model · main, one design-option branch, promote]_

Option A (v3) is never deleted; it stays in the plate's history and can be compared against v4 at any time.

## Roles and permissions

Access works on two levels, like GitHub: a workspace role decides what you can do across the workspace, and a project role decides what you can do inside one project. Members only see projects they were added to, unless they are an Owner or Admin.

**Workspace roles** (stored in Clerk Organizations)

| Action | Owner | Admin | Moderator | Member |
| --- | --- | --- | --- | --- |
| See every project in the workspace | Yes | Yes | No | No |
| Create projects | Yes | Yes | Yes | Yes |
| Invite and remove workspace members | Yes | Yes | No | No |
| Change workspace roles | Yes | Yes (not Owner) | No | No |
| Add members to a project | Yes | Yes | Projects they belong to | No |
| Permanently delete archived projects | Yes | Yes | No | No |
| Rename, transfer or delete the workspace | Yes | No | No | No |

**Project roles** (stored in PlateMate's database)

| Action | Head | Editor | Commenter | Viewer |
| --- | --- | --- | --- | --- |
| View plates, versions and compare | Yes | Yes | Yes | Yes |
| Add annotations and comments | Yes | Yes | Yes | No |
| Upload versions and create branches | Yes | Yes | No | No |
| Resolve annotations | Yes | Yes | Own only | No |
| Schedule crit sessions and write crit notes | Yes | Yes | No | No |
| Promote a branch to main | Yes | No | No | No |
| Edit project settings and client details | Yes | No | No | No |
| Add and remove project members | Yes | No | No | No |
| Archive and restore the project | Yes | No | No | No |

A workspace Owner or Admin can act as Head on any project in their workspace. In a solo workspace the single user is Owner and Head of everything.

## Requirements

The MVP (P0) is 24 requirements: accounts, workspaces, projects, versions, side-by-side compare, annotations, crits and email notifications. Branching and the richer compare modes follow in v1.1 (P1).

| Area | Requirement | Priority |
| --- | --- | --- |
| Accounts | Sign up and log in with email and password or a magic link | P0 · MVP |
| Accounts | Sign in with Google or Microsoft | P0 · MVP |
| Accounts | Enterprise SAML single sign-on for firms | P2 · Later |
| Accounts | Profile with name, photo, and school or firm | P0 · MVP |
| Workspaces | Create a solo or firm workspace | P0 · MVP |
| Workspaces | Invite members by email with a role; they accept or decline | P0 · MVP |
| Workspaces | Change member roles and remove members | P0 · MVP |
| Workspaces | Switch between workspaces | P0 · MVP |
| Projects | Create a project with name, client name, client contact, site location, project type, deadline and description | P0 · MVP |
| Projects | Project list with search and filters (status, client, deadline) | P0 · MVP |
| Projects | Edit project settings and client details (Head only) | P0 · MVP |
| Projects | Add and remove project members with a project role | P0 · MVP |
| Projects | Archive and restore; permanent delete after the waiting period, or manually by Owner or Admin | P0 · MVP |
| Plates and versions | Create plates in a project and upload the first version | P0 · MVP |
| Plates and versions | Upload a new version with a change note; see the version timeline | P0 · MVP |
| Plates and versions | Open any past version and download the original file | P0 · MVP |
| Plates and versions | Branch from any version to explore a design option | P1 · v1.1 |
| Plates and versions | Promote a branch to main; the old main stays in history | P1 · v1.1 |
| Plates and versions | Archive a branch that was not chosen | P1 · v1.1 |
| Compare | Side-by-side view of any two versions, zoom and pan locked together | P0 · MVP |
| Compare | Swipe slider and onion-skin overlay | P1 · v1.1 |
| Compare | Pixel diff that highlights what changed | P1 · v1.1 |
| Viewer and annotations | Deep-zoom viewer for large plates (A1/A0 at 300 DPI) | P0 · MVP |
| Viewer and annotations | Draw a point, rectangle or freehand annotation and start a comment thread on it | P0 · MVP |
| Viewer and annotations | Mark annotations open or resolved and assign them to a member | P0 · MVP |
| Viewer and annotations | Carry open annotations forward onto the next version | P1 · v1.1 |
| Viewer and annotations | Filter annotations by status, author and assignee | P1 · v1.1 |
| Crits and notes | Crit session with date, attendees, a pasted Zoom or Google Meet link, and the versions reviewed | P0 · MVP |
| Crits and notes | Email a calendar invite (.ics) to attendees | P0 · MVP |
| Crits and notes | Crit notes and project notes in a Notion-style block editor | P0 · MVP |
| Crits and notes | Create Zoom or Google Meet meetings automatically | P2 · Later |
| Notifications and activity | Email for invites, new versions, assignments, mentions and crit reminders | P0 · MVP |
| Notifications and activity | In-app notification inbox | P1 · v1.1 |
| Notifications and activity | Project activity log (who did what, when) | P0 · MVP |
| Notifications and activity | Per-user notification preferences | P1 · v1.1 |
| Collaboration | Live presence and real-time annotations | P2 · Later |
| Collaboration | Guest access for clients on a single project | P2 · Later |
| File formats | Previews for DWG, DXF, SketchUp and Rhino files | P2 · Later |

## Key user flows

**Set up a firm workspace**

1. Sign up with email or Google.
2. Create a workspace and choose Solo or Firm.
3. Invite members by email and pick each person's workspace role.
4. Invitees get an email, accept, and land in the workspace.

**Start a project**

1. Click New project.
2. Fill in the project name, client name, client contact, site location, project type, deadline and description.
3. Add project members and choose their project roles.
4. Create the first plates and upload a file for each.
5. PlateMate generates a preview; the plate shows as Ready within a minute.

**Run a revision cycle**

1. The Head schedules a crit session, pastes a meeting link and selects the versions to review.
2. Attendees get an email with a calendar invite.
3. During or after the crit, reviewers draw annotations on the plate and comment.
4. Annotations are assigned to the designer responsible.
5. The designer uploads a revised version with a change note.
6. Open annotations carry forward onto the new version for checking.
7. Reviewers compare the two versions and resolve annotations that were addressed.

**Explore and choose a design option**

1. An Editor branches from the current version, for example "Option B: L-shape".
2. They upload versions to the branch without touching main.
3. The team compares the latest version of main and of the branch.
4. The Head promotes the chosen branch to main. The other line stays in history and can be archived.

**Archive and delete a project**

1. The Head archives the project; it disappears from the project list.
2. Archived projects stay restorable for 30 days.
3. After 30 days, or when an Owner or Admin deletes it manually, the project and its files are permanently deleted.

## Supported plate formats

Plates are view-only: PlateMate stores the original file, renders a preview image, and all annotation happens on the preview. The MVP renders PDF, image, PSD and AI files; CAD and 3D formats are stored as attachments until a later release.

| Format | Typical use | How the preview is made | Release |
| --- | --- | --- | --- |
| PDF | Final plates, crit boards | pdfium renders each page to PNG | MVP |
| JPG, PNG, WebP, TIFF | Renders, scans, exported boards | sharp | MVP |
| HEIC | Phone photos of models and sketches | sharp with HEIF support | MVP |
| SVG | Diagrams | sharp | MVP |
| PSD | Photoshop boards | ag-psd reads the flattened image inside the file | MVP |
| AI | Illustrator boards | Rendered as PDF (needs PDF compatibility on save) | MVP |
| DXF | CAD drawings | ezdxf or dxf-viewer | Later |
| DWG | AutoCAD drawings | Paid converter (Autodesk Platform Services, ODA or CloudConvert); built-in thumbnail as fallback | Later |
| SKP, 3DM | SketchUp and Rhino models | Built-in preview thumbnail (low resolution) | Later |
| RVT | Revit models | Autodesk Platform Services (paid) | Later |
| IFC, GLB, OBJ | BIM and 3D exchange | web-ifc or three.js viewer | Later |

Until CAD support ships, users upload a PDF export for review and attach the original DWG, RVT, SKP or 3DM file to the same version. Large plates are cut into zoom tiles so an A0 sheet at 300 DPI opens without loading the full image.

## Architecture

The app runs on Vercel and only handles data and permissions; plate files go straight from the browser to S3 and are processed on AWS.

_[Diagram not included in this copy: architecture · app on Vercel, files on AWS]_

The monorepo has `frontend/` (Next.js) and `backend/` (Hono). The Hono API is mounted inside a Next.js route, so both deploy to Vercel as one app; `backend/` can move to AWS Lambda later without a rewrite.

## Non-functional requirements

These are proposed targets for the MVP; the file size limit is an open question below.

| Area | Requirement |
| --- | --- |
| Upload size | Up to 500 MB per file, uploaded directly to storage in parts so large files can resume |
| Preview speed | A 50 MB PDF plate shows as Ready within 60 seconds of upload |
| Viewer speed | First view of a plate in under 2 seconds on broadband; zooming loads tiles, not the full image |
| Page speed | App pages load in under 2.5 seconds (Largest Contentful Paint) |
| Access control | Every API call checks workspace and project role on the server; the UI hiding a button is never the only check |
| File access | Files are served only through short-lived signed URLs; storage buckets are never public |
| Data isolation | Every query is scoped to a workspace; one workspace can never read another's data |
| Upload safety | File type is checked from the file contents, not the extension |
| History | Versions are never overwritten or edited after upload; deletes are soft until permanently purged |
| Audit | Every create, update, archive, delete, promote and role change is written to the activity log |
| Accessibility | WCAG 2.2 AA for the app; viewer controls work by keyboard |
| Browsers | Latest two versions of Chrome, Edge, Safari and Firefox; desktop and tablet first, phone view-only |
| Backups | Daily database backups with point-in-time restore for 7 days |
| Cost | AWS Budgets alerts set before launch; no always-on servers in the MVP |

## Data model

PostgreSQL holds all structured data through Drizzle ORM; files live in S3 and the database stores only their keys. Clerk owns user identities and workspace membership, synced into these tables by webhook.

| Table | Holds | Key fields |
| --- | --- | --- |
| users | People, synced from Clerk | `clerk_user_id`, name, email, avatar |
| workspaces | Solo and firm workspaces | `clerk_org_id`, name, type (solo or firm) |
| workspace_members | Who belongs to a workspace and their role | `workspace_id`, `user_id`, role |
| projects | Design jobs | `workspace_id`, name, `client_name`, `client_contact`, location, type, deadline, `archived_at`, `deleted_at` |
| project_members | Who can see a project and their role | `project_id`, `user_id`, role |
| plates | Sheets inside a project | `project_id`, title, order, `main_branch_id`, `archived_at` |
| branches | Lines of versions per plate | `plate_id`, name, `head_version_id`, `created_from_version_id`, `archived_at` |
| plate_versions | One uploaded file per version, never edited | `plate_id`, `branch_id`, `parent_version_id`, number, `s3_key`, `file_hash`, `file_type`, `change_note`, status (processing, ready, failed), `uploaded_by` |
| version_attachments | Original CAD or model files attached to a version | `version_id`, `s3_key`, `file_name`, `file_type` |
| annotations | Shapes pinned to a version | `version_id`, page, shape (normalized 0 to 1 coordinates), status, `assignee_id`, `carried_from_id` |
| comments | Threads on annotations | `annotation_id`, `author_id`, body |
| crit_sessions | Scheduled reviews | `project_id`, title, `scheduled_at`, `meeting_url`, `reviewed_version_ids` |
| notes | Project notes and crit notes | `project_id`, `crit_session_id`, content (block editor JSON) |
| notifications | In-app and email notifications | `user_id`, type, payload, `read_at` |
| activity_log | Every change, for history and audit | `workspace_id`, `project_id`, `actor_id`, action, target, `created_at` |

## Success metrics

The proposed targets below measure whether people run real revision cycles in PlateMate, not just sign up. They are starting guesses to revisit after the first 3 months.

| Metric | What it shows | Target 3 months after launch |
| --- | --- | --- |
| Activated workspaces | Workspaces that uploaded 2 or more versions of one plate in their first week | 40% of new workspaces |
| Revision cycles | Plates with a version, at least one annotation, and a newer version | 50% of active projects |
| Annotation resolution | Annotations marked resolved within 14 days | 60% |
| Compare usage | Weekly active users who open a compare view | 30% |
| Retention | Workspaces active in week 4 after sign-up | 35% |
| Firm adoption | Firm workspaces with 3 or more members | 25 firms |
| Preview reliability | Uploads that reach Ready without failing | 99% |

## Release plan

The work ships in four phases, and each one starts only after the previous gate passes. Dates are not set yet.

_[Diagram not included in this copy: release plan · 4 phases, 3 gates]_

The MVP gate is the important one: a real class or firm has to complete a full upload, crit, annotate, revise and compare cycle before v1.1 work starts.

## Out of scope

The following are excluded from the MVP; some come back in later releases as marked in Requirements.

- Editing or marking up the original drawing file itself
- Pixel-level merging of two branches
- Native rendering of DWG, DXF, RVT, SKP, 3DM and IFC files
- Automatic creation of Zoom or Google Meet meetings
- Real-time co-editing of notes and live annotation presence
- Client guest access
- Native mobile apps (the web app is view-only on phones)
- Billing, plans and payments
- Enterprise SAML single sign-on

## Risks and mitigations

The biggest risk is users expecting native CAD files to work on day one; the PDF-export rule and clear messaging at upload handle it.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Users expect DWG, Revit or SketchUp files to render | Uploads look broken; users leave | Accept those files as attachments, ask for a PDF export, explain it at upload |
| Very large files (A0 TIFFs, multi-page PDFs) time out | Previews fail | Resumable direct uploads, a queue with retries, zoom tiles, a clear Failed state with retry |
| Storage and processing costs grow with every version | Monthly bill climbs | Content hashing to skip duplicates, cheaper storage for archived files, budget alerts |
| A permission bug exposes another firm's project | Loss of trust; firms will not adopt | Server-side checks on every call, workspace-scoped queries, automated permission tests |
| Students and firms want different things | Product tries to do both badly | Ship the shared core first; firm-only features (SSO, audit export, billing) after the MVP |
| Annotations land in the wrong spot on a new version | Feedback becomes confusing | Store normalized positions; show carried-forward annotations as "needs check" |
| Zoom and Google Meet APIs need app review | Meeting creation slips | Pasted meeting links and .ics invites in the MVP; integrations later |
| Third-party pricing or license changes (Clerk, Vercel, LocalStack) | Unexpected cost or rework | Keep data in PlateMate's own database; check terms before launch |

## Open questions

- [ ] Pricing: free for students, paid per seat for firms, or something else?
- [ ] License: keep the repo private (all rights reserved), or publish under AGPL-3.0 or FSL?
- [ ] Upload limit: is 500 MB per file enough for your largest plates?
- [ ] Archive waiting period: is 30 days before permanent deletion right?
- [ ] Classes: should instructors get a class workspace with student sub-projects, or do students invite instructors to their own projects?
- [ ] Clients: do firms need client guest access earlier than "Later"?
- [ ] Branch promotion: should Editors also be allowed to promote, or Head only?
- [ ] First users: which school or firm will test the MVP?

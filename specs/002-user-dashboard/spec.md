# Feature Specification: User Dashboard

**Feature Branch**: `002-user-dashboard` (no git branch created yet)

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "Build the dashboard of the signed-in user. It shows the user's projects, the recently opened projects, and some small details of each project right on the dashboard. It has a sidebar for navigation, a search, and a light or dark mode toggle."

**Source**: `docs/PRD.md`. The dashboard itself is not a named PRD feature. It builds on three P0 requirements: "Project list with search and filters (status, client, deadline)", "Switch between workspaces", and the project fields in "Create a project with name, client name, client contact, site location, project type, deadline and description". Anything the PRD leaves undecided is listed under Open Questions and is not invented here.

## Clarifications

### Session 2026-11-25

- Q: Are "Crits" and "Meetings" two separate sidebar screens, or one screen? → A: One screen. Meetings is dropped from the sidebar; the meeting link, date and attendees live inside each crit session (PRD).
- Q: Are "Archive" and "Trash" two separate sidebar screens, or one screen? → A: One screen. Trash is dropped from the sidebar; Archive holds archived projects, which can be restored until the PRD's waiting period ends or an Owner or Admin deletes them.
- Q: Until their screens exist, should unbuilt sidebar entries be greyed out as "coming soon" or hidden? → A: Greyed out and marked "coming soon", but only during development, for the team; a release hides entries that have no screen.
- Q: How long should a project stay in a person's "Recently opened" history? → A: No expiry. Only the latest visit per project is kept, and the 5 newest are shown.
- Q: In what order should the full project list be shown by default? → A: Last activity, newest first; projects with no activity last, ordered by name.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See my projects at a glance (Priority: P1)

After signing in, a person lands on a dashboard that lists the projects they can see in their current workspace. Each project is a card that shows a few small details, so the person can tell projects apart and spot what needs attention without opening each one. The whole card is clickable and opens the project.

**Why this priority**: This is the first screen after sign-in and the way into every project. Without it, signing in leads nowhere.

**Independent Test**: Sign in as a person who belongs to a workspace with several projects. The dashboard lists exactly the projects that person is allowed to see, each with its small details, and nothing from other workspaces or from projects they were not added to.

**Acceptance Scenarios**:

1. **Given** a signed-in person with access to several projects, **When** they open the dashboard, **Then** each of those projects appears once, with its name and its small details.
2. **Given** a signed-in person who was not added to a project and is not a workspace Owner or Admin, **When** they open the dashboard, **Then** that project does not appear.
3. **Given** a project that is archived, **When** the person opens the dashboard, **Then** it does not appear in the list (PRD: archived projects disappear from lists).
4. **Given** a person with no projects yet, **When** they open the dashboard, **Then** they see a clear empty state that says there are no projects and what to do next.
5. **Given** a project card, **When** the person clicks anywhere on it, **Then** they go to that project.
6. **Given** a keyboard-only person, **When** they tab to a project card and press Enter, **Then** the project opens, and the card shows a visible focus.

---

### User Story 2 - Jump back into recently opened projects (Priority: P1)

The dashboard has a "Recently opened" area above the full list, showing the projects the person opened most recently, newest first, so they can continue where they left off.

**Why this priority**: Most visits are to continue one or two active projects. This makes that a single click.

**Independent Test**: Open three projects in turn, return to the dashboard, and see those three at the top of "Recently opened" in reverse order of opening.

**Acceptance Scenarios**:

1. **Given** a person who has opened projects before, **When** they return to the dashboard, **Then** the most recently opened projects appear in "Recently opened", most recent first.
2. **Given** a person opens a project that is already in the list, **When** they return to the dashboard, **Then** it moves to the front and appears once.
3. **Given** a person who has never opened a project, **When** they open the dashboard, **Then** the "Recently opened" area shows a short hint or is not shown, and the dashboard does not look broken.
4. **Given** a recently opened project that was archived or that the person can no longer access, **When** they open the dashboard, **Then** it is not shown.
5. **Given** two people who opened different projects, **When** each opens the dashboard, **Then** each sees only their own recent history.

---

### User Story 3 - Move around with a sidebar (Priority: P1)

A sidebar on the dashboard lets the person navigate the app. It stays in place while they move between sections and shows which section they are in.

**Why this priority**: The sidebar is the app's main navigation, and every later screen (plates, crits, settings) hangs off it.

**Independent Test**: From the dashboard, use only the sidebar to reach each destination it lists, and see the current one marked.

**Acceptance Scenarios**:

1. **Given** the dashboard, **When** the person selects a sidebar entry, **Then** they go to that destination and the entry is marked as current.
2. **Given** a keyboard-only person, **When** they tab through the sidebar, **Then** every entry can be reached and activated, with a visible focus.
3. **Given** a narrow screen, **When** the dashboard opens, **Then** the sidebar collapses to a form that can still be opened and used.

---

### User Story 4 - Search my projects (Priority: P2)

A search box on the dashboard narrows the project list as the person types, so they can find a project by name quickly when there are many.

**Why this priority**: Useful as soon as a firm has more than a handful of projects, and the PRD calls for search on the project list. The dashboard is still useful without it.

**Independent Test**: With ten projects, type part of one project's name and see only matching projects; clear the box and see all of them again.

**Acceptance Scenarios**:

1. **Given** a list of projects, **When** the person types part of a project name, **Then** only projects that match are shown, ignoring upper and lower case.
2. **Given** a search with no matches, **When** results update, **Then** the person sees a "no results" message that includes what they searched for and a way to clear it.
3. **Given** a search term, **When** the person clears it, **Then** the full list returns.
4. **Given** a search term, **When** results appear, **Then** they never include a project the person could not see without searching.

---

### User Story 5 - Switch between light and dark mode (Priority: P2)

A toggle on the dashboard switches the app between light and dark mode. The choice is remembered, so the next visit looks the same.

**Why this priority**: A comfort feature for people who work long hours on dark drawings and boards. The dashboard works without it.

**Independent Test**: Turn dark mode on, reload the page and reopen the app later; the dashboard is still dark. Turn it off; it is light again.

**Acceptance Scenarios**:

1. **Given** the dashboard in light mode, **When** the person uses the toggle, **Then** the whole dashboard switches to dark mode, and back again.
2. **Given** a person who chose a mode, **When** they reload or come back later on the same device, **Then** the dashboard opens in that mode, without a flash of the other mode first.
3. **Given** a person who has never chosen, **When** they first open the dashboard, **Then** it follows their device's light or dark setting.
4. **Given** either mode, **When** the person reads the dashboard, **Then** text and controls keep readable contrast.

### Edge Cases

- A person with no projects: the empty state replaces both the list and "Recently opened".
- A person with a very large number of projects: the list stays usable (for example it does not load everything at once and does not freeze).
- Very long project names, client names or missing optional details: cards stay readable and the layout does not break; a missing detail is simply not shown.
- A project that is archived or deleted, or access removed, while it sits in "Recently opened": it disappears without an error.
- A person who belongs to more than one workspace: the dashboard shows the current workspace only, never a mix.
- Loading and failure: while data loads the person sees a loading state, and if it fails they see a clear error with a way to retry, never a blank page.
- A signed-out visitor requests the dashboard: they are sent to log in (covered by `001-user-auth`) and returned to the dashboard afterwards.
- Search text containing symbols or very long text does not break the page or the results.
- Two browser tabs: opening a project in one is reflected in "Recently opened" the next time the dashboard loads in the other.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST be the first screen a signed-in person lands on, and MUST be unreachable while signed out.
- **FR-002**: The dashboard MUST list the projects the person can see in their current workspace, and MUST NOT show projects from other workspaces, projects they were not added to (unless they are a workspace Owner or Admin), or archived projects. The list MUST be ordered by last activity, newest first; projects with no activity come last, ordered by name.
- **FR-003**: Each listed project MUST appear as a card showing exactly these details: project name, client name, deadline, member count and last activity. A detail the project does not have (for example no client name or no deadline) is left out of that card without leaving a gap. Last activity is shown as a relative time such as "2 days ago".
- **FR-004**: The whole project card MUST be clickable and take the person to that project, and MUST work with the keyboard. The same card form is used in "Recently opened".
- **FR-005**: The dashboard MUST show a "Recently opened" area of the projects the person opened most recently, newest first, each project once, scoped to that person only.
- **FR-006**: Opening a project MUST update that person's recent history; a project that is archived, deleted or no longer accessible MUST NOT be shown there.
- **FR-007**: The dashboard MUST show a clear empty state when the person has no projects, and a sensible state when there is no recent history yet.
- **FR-008**: The dashboard MUST have a sidebar listing these destinations: Dashboard, Projects, Activity, Crits, Archive and Settings. It MUST mark the current one. While the app is under development, a destination whose screen is not built yet MUST be shown greyed out and marked "coming soon", MUST NOT be clickable, MUST be announced to screen readers as unavailable, and MUST NOT lead to a broken page. This is a development aid for the team: a release MUST NOT show destinations that have no screen.
- **FR-009**: The dashboard MUST have a search that narrows the project list by project name as the person types, case-insensitive, with a clear way to reset it and a "no results" state.
- **FR-010**: The dashboard MUST have a light and dark mode toggle that applies to the whole dashboard, is remembered between visits on the same device, and defaults to the device's setting on first visit.
- **FR-011**: Which projects a person sees MUST be decided on the server for every request. A hidden or filtered item in the browser is never the only check.
- **FR-012**: The dashboard MUST show loading and error states, and MUST NOT leave a blank page when data fails to load.
- **FR-013**: The dashboard MUST be usable by keyboard and meet WCAG 2.2 AA in both light and dark mode, and MUST work on desktop and tablet widths, with a usable collapsed layout on a phone (PRD: desktop and tablet first, phone view-only).
- **FR-014**: Any text from project data (names, client names) MUST be shown as plain text and never interpreted as markup.

### Key Entities *(include if feature involves data)*

- **Project**: One design job in a workspace. Shown on the dashboard as a card with its name, client name, deadline, member count and last activity. Archived and deleted projects are not shown.
- **Project activity**: The time of the latest recorded change in a project (PRD activity log), used for "last activity".
- **Recent project visit**: A record that one person opened one project, with when. It is private to that person, and only the latest visit per project matters for ordering.
- **Workspace**: The space whose projects the dashboard shows. The dashboard shows the person's current workspace.
- **Person**: The signed-in user, from `001-user-auth`, whose role in the workspace and in each project decides which projects they see.
- **Display preference**: The person's light or dark choice, remembered on their device.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person reaches any of their projects from the dashboard in 2 clicks or fewer (one click for any project in "Recently opened").
- **SC-002**: The dashboard is readable and usable (projects and sidebar visible) within 2.5 seconds on broadband (PRD page-speed target).
- **SC-003**: Search results update within 1 second of the person stopping typing, with 200 projects in the workspace.
- **SC-004**: In testing with at least two people in the same workspace and two workspaces, 0 projects appear on a dashboard that the person is not entitled to see.
- **SC-005**: A person's dark or light choice is still applied on the next visit in 100% of tests, with no visible flash of the other mode.
- **SC-006**: Every dashboard control is reachable and usable with the keyboard alone, and text contrast meets WCAG 2.2 AA in both modes.
- **SC-007**: At least 90% of first-time testers can find and open a specific project from the dashboard on their first try without help.

## Assumptions

- **Depends on features that do not exist yet**: workspaces and projects (PRD P0) are separate features, and "last activity" needs the project activity log (also P0). This spec assumes they provide the data (a current workspace, projects with name, client name and deadline, members, project roles, and the time of the latest activity). Until they exist, the dashboard can only show its empty state.
- **Out of scope here**: creating, editing, archiving or deleting projects; creating or switching workspaces (the dashboard shows the current workspace only); plates, versions, compare, annotations, crits, notes and notifications; filters by status, client or deadline (the PRD lists them with the project list, but this feature asks only for search); an in-app notification inbox.
- **Signed-in only**: sign-in, sign-out and route protection come from `specs/001-user-auth`. This feature does not change them.
- **"Recently opened" is per person**: ordered by the person's last open of each project, newest first, one entry per project, showing the 5 most recent. The 5 is an adjustable default, not a PRD decision. A visit never expires: only the person's latest visit per project is kept, and older ones fall out of view by being pushed past the 5 newest or by the project being archived or becoming inaccessible.
- **Search matches project names only**, in the current workspace (decided with the owner). Client names, plates, notes and people are not searched.
- **Sidebar destinations are listed ahead of their screens**: only the dashboard exists in this feature. While the app is under development the other entries are shown greyed out as "coming soon", so the team sees the sidebar as designed (decided with the owner). Before a release, entries whose screens are not built are hidden.
- **Theme choice is stored on the device**: it is not tied to the account, and it follows the device setting until chosen. Storing it per account is a possible later change.
- **Dark mode needs a design**: the app's dark tokens are still the old defaults and do not match the "Title Block" look (see `project-context`). Designing dark mode is part of this feature's UI work, through the `impeccable` skill, and **the user picks the layout**.
- **Phone**: the web app is view-only on phones (PRD), so the dashboard only needs a usable collapsed sidebar there.
- **Language**: English only, like the rest of the app.

## Open Questions

PRD gaps recorded here and not invented, per the constitution. All three clarification questions and both sidebar follow-ups are answered.

- Decided with the owner: cards show project name, client name, deadline, member count and last activity. Project type, site location, plate count, the person's role and the description were offered and not chosen.
- Decided with the owner: search covers project names only.
- Decided with the owner: the sidebar lists Dashboard, Projects, Activity, Crits, Archive and Settings. Meetings and Trash were dropped because they overlap the PRD: a crit session already holds the meeting link, date and attendees, and the PRD has only "Archive" (a project hidden from lists and permanently deleted after a waiting period, or by an Owner or Admin) with no separate trash (see Clarifications).
- The PRD has no "dashboard", no "recently opened" and no light or dark mode requirement. Treated here as a new, small P1/P2 addition; the owner should confirm it belongs in the MVP.
- How many recent projects to show is not in the PRD (5 is the default used above). How long they stay in the history is decided: no expiry (see Clarifications).
- Whether the project list can be sorted by the person is not in the PRD and is out of scope. The default order is decided: last activity, newest first (see Clarifications).
- What "status" means for a project: the PRD lists "status" as a filter but defines only archived. Not needed for this spec; it matters when filters are added.

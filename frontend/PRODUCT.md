# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences share one product, and neither is primary: design decisions serve both equally.

- **Architecture students** work in solo or class workspaces. They need a clean history of every plate revision for crits and portfolio.
- **Architecture firms** work in shared workspaces: principals and admins control access, project architects (project heads) run revisions, designers and junior architects upload versions and respond to feedback.
- **Instructors and crit jurors** are invited to student projects to pin feedback and check whether it was addressed.
- **Clients** get guest access to one project later; they are not in the first release.

Desktop and tablet come first. Phones are view-only.

## Product Purpose

PlateMate is a workspace where architecture students and firms track every revision of their plates, compare versions side by side, and mark up what needs to change. It works like git for drawings: every upload is a version, design options are branches, and crits leave notes pinned to the exact spot on the plate.

It exists because plate history ends up scattered across files named `final_v3_REAL.pdf`, chat threads and printed crit markups, so nobody can say what changed between two versions, which comments were addressed, or which design option was chosen and why.

The first release succeeds if a student or a small firm can run a full revision cycle in it: upload, crit, annotate, revise, compare.

## Positioning

Version control and critique built for architectural plates: versions that are never overwritten, design options as branches that are promoted rather than merged, and feedback pinned to an exact spot on a plate and tracked to resolved. It is not a drawing editor, a CAD file manager or a BIM platform.

## Operating Context

Plates are view-only. PlateMate stores the original file, renders a preview image, and all annotation happens on the preview. Users keep drawing in AutoCAD, Revit, Rhino, SketchUp or Photoshop. Plates are large (A1 and A0 at 300 DPI), so the viewer is a deep-zoom viewer that loads tiles.

A workspace holds projects, a project holds plates, and each plate has its own version history. A revision cycle runs: schedule a crit, annotate plates during or after it, assign annotations, upload a revised version with a change note, carry open annotations forward, compare the two versions, resolve what was addressed.

Access has two levels. Workspace roles (Owner, Admin, Moderator, Member) are held in Clerk Organizations; project roles (Head, Editor, Commenter, Viewer) are held in the database. Members only see projects they were added to, unless they are an Owner or Admin.

## Capabilities and Constraints

- **First release (P0):** accounts, workspaces and invites, projects, plate upload and the version timeline, side-by-side compare with locked zoom and pan, point, rectangle and freehand annotations with comment threads, crit sessions and notes, email notifications, a project activity log.
- **Version 1.1 (P1):** branches and promotion, swipe slider, onion-skin and pixel-diff compare, annotations carried forward, annotation filters, in-app inbox and notification preferences.
- **Later (P2):** live presence, client guest access, SAML single sign-on, automatic Zoom or Meet meetings, previews for DWG, DXF, SketchUp and Rhino.
- **Formats:** the first release previews PDF, images (JPG, PNG, WebP, TIFF, HEIC, SVG), PSD and AI. CAD and 3D files are stored as attachments next to a PDF export.
- **Terminology:** workspace, project, plate, version, branch, main, promote, annotation, crit session, archive. Branches are promoted, never merged.
- **Targets:** WCAG 2.2 AA; viewer controls work by keyboard; first view of a plate under 2 seconds on broadband; pages under 2.5 seconds LCP; latest two versions of Chrome, Edge, Safari and Firefox.
- **Undecided (open in the PRD):** pricing, license, the 500 MB upload limit, the 30-day archive wait, class workspaces for instructors, earlier client access, and whether Editors may promote a branch.

Full requirements: [docs/PRD.md](../docs/PRD.md).

## Brand Commitments

Only the name "PlateMate" is fixed. No logo, voice, colors or visual references are binding yet.

## Evidence on Hand

The PRD in [docs/PRD.md](../docs/PRD.md) is the only product document. There are no real customers, testimonials, benchmarks, pricing or user research yet, and none of those may be invented. The three diagrams in the PRD (versioning model, architecture, release plan) were not preserved.

## Product Principles

1. **History is never lost.** Versions are never overwritten or edited; what changed and why is always recoverable.
2. **Feedback lives on the plate.** Comments are pinned to an exact spot and tracked to resolved, not scattered across chat and print.
3. **The same product for one student and for a firm.** A shared core first; firm-only features come after the first release.
4. **View, don't edit.** PlateMate shows and annotates plates; it never replaces the drawing tools.
5. **Private by default.** Projects are visible only to invited members, and the server checks roles on every call.

## Accessibility & Inclusion

WCAG 2.2 AA for the app, with keyboard-operable viewer controls. Phones are view-only.

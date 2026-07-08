# Project Handoff: Accomplished Changes

This document provides a comprehensive summary of all modifications, bug fixes, and refinements completed in the **Plate-Mate** application so far.

---

## 1. Frontend UI & UX Refinements

### Card Readability Scaling (75% Screen Zoom Support)
* **Problem**: The interface text was too small and difficult to read when viewed at 75% screen zoom.
* **Fix**: Scaled up font classes across card layouts in `src/app/projects/page.tsx` (e.g., updated `text-[10px]` to `text-xs`, `text-sm` to `text-base`, and badges from `text-[8px]` to `text-[10px]`).
* **Visual Polish**: 
  * Removed the thick horizontal priority color highlight bars from the top of project cards to clean up the design.
  * Balanced vertical layout spacing by adjusting project card headers padding to `p-5 pb-2 pt-5`.

### Navigation & Routing
* **Clickable Project Rows**: Modified `src/app/dashboard/project-row.tsx` to accept project `id` and wrap row items in a Next.js `<Link href={`/projects/${id}`}>` component, making navigation intuitive.
* **Header Folder Parameters Collapse**: Adjusted `src/components/general-components/header.tsx` to suppress raw dynamic UUID directory names (like project ID segments) from the page breadcrumbs header, displaying `"Projects"` instead of `"Projects/11111111-..."`.

---

## 2. Database & RLS Policy Resolutions

### Row-Level Security (RLS) Policy Insertion Fix
* **Problem**: Creating a new project triggered error `42501: new row violates row-level security policy for table "tbl_projects"`.
* **Root Cause**: During `INSERT ... RETURNING *` (which Supabase uses on insertion), Postgres evaluates the SELECT policy (`is_project_member(id)`) on the new candidate row. Because the row was not yet committed, the subquery inside the function could not read the table recursively, returning `false` and violating RLS.
* **Fix**: Updated `tbl_projects` SELECT policy to directly check `owner_id = auth.uid()` inline. This resolves instantly on the candidate row without table scan loops:
  ```sql
  CREATE POLICY "projects: members can view"
    ON tbl_projects FOR SELECT
    USING (owner_id = auth.uid() OR is_project_member(id));
  ```
  *(Changes persisted in `supabase/migrations/20260705234249_update_rpojects_select_policy.sql` and `supabase/schema/policies/projects.sql`)*

### Schema Permission Persistence
* **Problem**: Resetting the database wiped table access privileges for frontend roles, causing `permission denied for table tbl_projects`.
* **Fix**: Added explicit privilege grants to `anon`, `authenticated`, and `service_role` roles in the migration file to ensure permissions persist across local database resets.

---

## 3. Local Supabase Auth Integration

### Seed Credential Synchronization
* **Problem**: Users logging in manually faced credentials mismatch or missing workspaces because the local seed registered the user as `olmedalden4@gmail.com` (missing the "o") while the browser user registered as `olmedoalden4@gmail.com`.
* **Fix**: Synced the login email to `olmedoalden4@gmail.com` in both `auth.users` and `auth.identities` inside `supabase/seed.sql`.

### GoTrue Scan Crash NULL Resolution
* **Problem**: Logging in returned `500: Database error querying schema` because the GoTrue auth container driver crashed trying to scan nullable DB columns into Go string variables.
* **Fix**: Updated all three users inside `supabase/seed.sql` to explicitly populate nullable auth columns (`confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change_token_current`, `email_change`, `phone_change`, `phone_change_token`, `reauthentication_token`) with empty strings (`''`) instead of database `NULL`s.

---

## 4. Frontend Toast Error Message Sanitization

* **Problem**: When authentication or database operations failed, raw technical messages (like `"Database error querying schema"`) were shown directly to the user in toast notifications.
* **Fix**: Refactored the authentication toast alerts in `LoginForm.tsx` and `SignUpForm.tsx`:
  * Technical/backend errors are cleanly logged on the browser console for developer access (`console.error`).
  * Toast alerts display professional, user-safe copy:
    * *Database/Schema Startup*: `"We are experiencing technical difficulties. Please try again in a few moments."`
    * *Invalid Credentials*: `"The email or password you entered is incorrect."`
    * *Network/Connection Errors*: `"Something went wrong. Please try again later."`


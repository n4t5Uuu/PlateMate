# Plate Versioning & Project Details

## What it is

The core differentiator of PlateMate is its architectural plate versioning system. Rather than treating technical drawings, 3D renders, or layout sheets as static file attachments, PlateMate treats them as interactive and version-controlled states. 

A project details page (`/projects/[id]`) acts as a high-fidelity control center for an architectural design project. It coordinates:
1. **Interactive Review Canvas**: Markup drawings with relative pin-based annotations.
2. **Sheet Submission Checklist**: Drawing list with real-time completion state toggles and automatic project progress adjustments.
3. **Inspiration Moodboard**: Facade finishes, references, and styles inspiration cards.
4. **Jury Crit Sessions Log**: Structural and circulation critique session feedback notes.
5. **AI Design Companion**: Architectural building code, client brief constraints, and setbacks consulting.

---

## Architectural Data Layer Flow

To avoid cluttering the visual UI components, PlateMate strictly separates database/API requests, local client state orchestration, and layout rendering layers.

```
       [ Supabase Database ]
                 ▲
                 │ (Raw SQL / PostgREST)
                 ▼
     [ src/lib/project-helper.ts ]  <--- Database Operations & Formatter Layer
                 ▲
                 │ (Clean Promises & DTOs)
                 ▼
[ src/hooks/use-project-details.ts ] <--- Client-side State & Logic Orchestrator
                 ▲
                 │ (Interactive States, Handlers)
                 ▼
 [ src/app/projects/[id]/page.tsx ]   <--- High-Fidelity UI Presentation Layout
```

Never bypass these layers. The Page component should never import or call `browserSupabase` directly; it consumes hooks, and hooks consume helper methods.

---

## Code Organization & Files

### 1. Database Operations Layer
*   **Path**: [project-helper.ts](file:///C:/Users/Alden%20Olmedo/Documents/VSCode/plate-mate/src/lib/project-helper.ts)
*   **Role**: Direct interface with Supabase client wrappers, sanitization of entries, error logging (`console.error`), and mapping raw DB names to clean camelCase models.
*   **Key Helpers Added**:
    *   `getPlateVersions(supabase, projectId)`: Retrives technical sheet version records.
    *   `getVersionAnnotations(supabase, versionId)`: Retrieves pin positions and feedback.
    *   `createAnnotation(supabase, annotationData)`: Persists feedback pins into the cloud.

### 2. Client Logic & Fallback Orchestration
*   **Path**: [use-project-details.ts](file:///C:/Users/Alden%20Olmedo/Documents/VSCode/plate-mate/src/hooks/use-project-details.ts)
*   **Role**: Coordinates hooks, local state trackers, error toasts, and provides fallback mock values if the database schemas do not exist or tables are empty. This ensures a fully functional frontend playground.
*   **Key States Exposed**:
    *   `project`: Title, description, priority status, progress, due date.
    *   `versions`: Version history entries.
    *   `annotations`: Array of feedback pins mapped on the plate.
    *   `checklistItems`: Drawing sheets required.
    *   `moodItems`: Inspiration gallery reference cards.
    *   `crits`: Lecture, jury, and professor feedback notes.
    *   `loading`: Boolean loader indicator.

### 3. Layout Presentation Layout
*   **Path**: [page.tsx](file:///C:/Users/Alden%20Olmedo/Documents/VSCode/plate-mate/src/app/projects/%5Bid%5D/page.tsx)
*   **Role**: Renders the complete dynamic experience. Fully responsive grid supporting glassmorphism cards, interactive coordinate pins, tabs, image markups, list deleting/creating, progress indicators, and chatbot simulation.

---

## Detailed Backend Mapping (Learn the Code)

### Dynamic Pin Math (Relative Coordinates)
To make drawing markup pins responsive, coordinates are computed as percentage offsets of the image width and height:
$$x\% = \left(\frac{e.clientX - rect.left}{rect.width}\right) \times 100$$
$$y\% = \left(\frac{e.clientY - rect.top}{rect.height}\right) \times 100$$

When rendering, they are placed with absolute positioning styles:
```tsx
style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
```
This ensures the pins scale perfectly whether the user zooms in, resizes their browser, or views the drawing on a mobile device.

### Supabase Table Structure

To align the database tables with these fields, run the combined SQL queries in the Supabase SQL Editor. Here are the primary definitions:

```sql
-- 1. Versions Table
CREATE TABLE tbl_versions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id        UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  version_number    INT NOT NULL,
  label             TEXT,
  notes             TEXT,
  file_url          TEXT,
  status            TEXT DEFAULT 'draft', -- draft / submitted / approved / rejected
  UNIQUE (project_id, version_number)
);

-- 2. Annotations Pin Table
CREATE TABLE tbl_version_annotations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  version_id    UUID NOT NULL REFERENCES tbl_versions(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES tbl_users(id) ON DELETE SET NULL,
  pos_x         FLOAT NOT NULL, -- horizontal percentage offset (0 to 100)
  pos_y         FLOAT NOT NULL, -- vertical percentage offset (0 to 100)
  content       TEXT NOT NULL,
  status        TEXT DEFAULT 'open' -- open / resolved
);

-- 3. Checklists & Items Table
CREATE TABLE tbl_submission_checklists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES tbl_projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL
);

CREATE TABLE tbl_checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID NOT NULL REFERENCES tbl_submission_checklists(id) ON DELETE CASCADE,
  sheet_type    TEXT NOT NULL, -- site plan, elevations, floor plans
  scale         TEXT DEFAULT '1:100',
  is_completed  BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ
);
```

### Row Level Security (RLS) Policies
Always protect backend data layers. Check workspace membership inside `policies.sql` to authorize read/write access:

```sql
-- Enable RLS
ALTER TABLE tbl_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_version_annotations ENABLE ROW LEVEL SECURITY;

-- Workspace Member Select Policy
CREATE POLICY select_versions ON tbl_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tbl_workspace_members
      WHERE user_id = auth.uid() 
      AND workspace_id = (SELECT workspace_id FROM tbl_projects WHERE id = project_id)
    )
  );

-- Workspace Member Insert/Update Policy
CREATE POLICY modify_versions ON tbl_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tbl_workspace_members
      WHERE user_id = auth.uid() 
      AND workspace_id = (SELECT workspace_id FROM tbl_projects WHERE id = project_id)
    )
  );
```

---

## Verifying Implementation Works Locally

1.  **Boot Dev Server**: Run `npm run dev` to start the local Next.js client.
2.  **Access Project Dynamic Route**: Navigate to a project's detailed canvas via `/projects/[id]` (or create a new project to trigger the redirected routing).
3.  **Upload Drawing**: Click the **Upload Design Plate** button and pick any layout draft image (mocked file storage).
4.  **Mark Up Pins**: Left-click anywhere on the loaded drawing image, enter your feedback comments, and hit **Save Pin**. Check that a green/yellow pin is placed.
5.  **Toggle checklist**: Navigate to **Checklist** tab, mark drawing sheets complete, and see the overall progress calculation update in real time.
6.  **AI consultation**: Click the **AI Companion** tab and ask queries like "what are the stair guidelines?" to test simulated responses.

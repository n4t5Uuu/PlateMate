# Adding a Feature

End-to-end pattern for adding a new data-backed feature. Uses "Projects" as the example since it's the next thing to build.

## The full stack

```
DB table + policies
    ↓
Helper (lib/project-helper.ts)
    ↓
Hook (hooks/use-projects.ts)
    ↓
Component / Dialog
    ↓
Page
```

Never skip layers. Components don't call `browserSupabase` directly — that goes in the helper.

---

## Step 1 — SQL

Add your table to `src/lib/supabase/schema/`. Follow the existing conventions:

- Table name: `tbl_yourfeature`
- File: `create_tables.sql` (add to it, don't create a separate file unless it's a function)
- Enable RLS: `ALTER TABLE tbl_yourfeature ENABLE ROW LEVEL SECURITY;`
- Add policies in `policies.sql` using `is_workspace_member()` for reads, `is_workspace_owner()` for writes

If you need a SECURITY DEFINER function (e.g. for a chicken-and-egg RLS situation):
- Add it to `src/lib/supabase/schema/functions/`
- Add it to `combine-schema.ps1` in the correct order (plpgsql functions come first)
- Use `public.tbl_name` — not bare `tbl_name`

Deploy with `.\combine-schema.ps1` → paste into Supabase SQL Editor.

---

## Step 2 — Helper

Create `src/lib/project-helper.ts`:

```ts
import { browserSupabase } from "./supabase/browser"

function extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "object" && error !== null && "message" in error)
        return String((error as any).message)
    return "An unexpected error occurred"
}

export async function getProjects(workspaceId: string) {
    const { data, error } = await browserSupabase
        .from("tbl_projects")
        .select("*")
        .eq("workspace_id", workspaceId)

    if (error) {
        console.error("[getProjects]", error)
        return { projects: null, error: extractMessage(error) }
    }

    return { projects: data, error: null }
}

export async function createProject(workspaceId: string, name: string) {
    const { data, error } = await browserSupabase
        .from("tbl_projects")
        .insert({ workspace_id: workspaceId, name })
        .select()
        .single()

    if (error) {
        console.error("[createProject]", error)
        return { project: null, error: extractMessage(error) }
    }

    return { project: data, error: null }
}
```

---

## Step 3 — Hook

Create `src/hooks/use-projects.ts`:

```ts
"use client"
import { useEffect, useState } from "react"
import { getProjects } from "@/lib/project-helper"

export function useProjects(workspaceId: string | null) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!workspaceId) return
        setLoading(true)
        getProjects(workspaceId).then(({ projects }) => {
            if (projects) setProjects(projects)
            setLoading(false)
        })
    }, [workspaceId])

    return { projects, loading }
}
```

---

## Step 4 — Dialog / Form

Add a dialog in `src/components/dialogs/`. Follow the pattern in `NewWorkspaces.tsx`:
- Controlled form state
- `isSubmitting` boolean to disable the button during the request
- `toast.success()` on success, `toast.error()` with friendly message on failure
- Never pass raw error objects to toast — use `extractMessage()`
- Reset form fields in the `finally` block

---

## Step 5 — Wire to page

In the page or layout component, call the hook and pass data down:

```tsx
const { workspaces } = useWorkspaces()
const activeWorkspaceId = workspaces[0]?.id ?? null
const { projects } = useProjects(activeWorkspaceId)
```

---

## Checklist before shipping

- [ ] RLS policies cover all operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] Helper logs errors with `console.error("[fnName]", error)`
- [ ] Toasts use friendly messages, not raw error strings
- [ ] TypeScript types defined in `src/types/`
- [ ] No `any` unless truly unavoidable

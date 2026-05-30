# Skill: Backend Logic

Apply this when writing helpers, hooks, API routes, SQL functions, or RLS policies.

## Helper Pattern

File: `src/lib/[name]-helper.ts`

```ts
import { SupabaseClient } from "@supabase/supabase-js"

function extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "object" && error !== null && "message" in error)
        return String((error as any).message)
    return "An unexpected error occurred"
}

export const exampleHelper = {
    async getData(supabase: SupabaseClient, userId: string) {
        try {
            const { data, error } = await supabase
                .from("tbl_example")
                .select("*")
                .eq("user_id", userId)

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error("[getData]", error)
            return { success: false, error: extractMessage(error) }
        }
    }
}
```

## RLS-Bypassing Operations

When a frontend operation hits an RLS chicken-and-egg problem, create a SECURITY DEFINER RPC function:

```sql
CREATE OR REPLACE FUNCTION do_something(param TEXT)
RETURNS UUID AS $$
DECLARE result_id UUID;
BEGIN
    INSERT INTO public.tbl_example (name)
    VALUES (param)
    RETURNING id INTO result_id;
    RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Then call it from the frontend:
```ts
const { data, error } = await supabase.rpc("do_something", { param: value })
```

Rules for SECURITY DEFINER functions:
- Always use `public.tbl_name` (fully qualified) — search_path is restricted
- Add the function to `combine-schema.ps1` and redeploy

## API Route Pattern

File: `src/app/api/[name]/route.ts`

```ts
import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(req: Request) {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // ... logic
}
```

## Supabase Query Patterns

```ts
// Select with join
supabase.from("tbl_workspace_members")
    .select("workspace_id, tbl_workspaces(id, name)")
    .eq("user_id", userId)

// Insert and return
supabase.from("tbl_workspaces")
    .insert({ name })
    .select()
    .single()

// RPC call
supabase.rpc("function_name", { param1: value1 })
```

## Middleware (Session Validation)

- Always `getUser()` — never `getSession()` (getSession doesn't validate with server)
- The cookie `setAll` in middleware must write to both request AND response or tokens are lost
- Protected routes: `/dashboard`, `/projects`, `/calendar`, `/teams`, `/trash`, `/settings`, `/workspace`

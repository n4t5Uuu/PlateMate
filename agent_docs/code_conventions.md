# Code Conventions

## General

- TypeScript everywhere — no `any` unless unavoidable
- No comments unless the WHY is non-obvious
- No unused imports or variables
- Prefer named exports for components/dialogs, default exports for pages

## Error Handling

- Frontend toasts: always user-friendly messages, never raw DB errors
- Backend: always `console.error("[functionName]", error)` in catch blocks
- Use `extractMessage(error)` from `workspace-helper.ts` pattern to safely get a string from any error (handles Supabase PostgrestError which is not a native JS Error)

```ts
function extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "object" && error !== null && "message" in error) return String((error as any).message)
    return "An unexpected error occurred"
}
```

## Styling

- Tailwind CSS utility classes only — no custom CSS unless unavoidable
- `glass-morphism` class for cards and panels
- `text-muted-foreground` without heavy opacity modifiers (avoid `/40`, `/50` — breaks light mode)
- Hover pattern: `hover:bg-primary/5 hover:border-primary/50 hover:-translate-y-0.5 active:translate-y-0`
- Always consider 75% browser zoom when sizing elements

## Supabase

- Use `browserSupabase` in client components and hooks
- Use `createServerSupabase()` in Server Components and API routes
- Always use `getUser()` for session validation — never `getSession()` (security risk)
- All SECURITY DEFINER functions must use fully-qualified table names: `public.tbl_tablename`

## Toasts (Sonner)

```ts
toast.success("Short success message")
toast.error("Short user-friendly error", {
    description: "More detail here if needed."
})
```

Never pass `result.error` or raw error objects directly to toast.

## SQL

- All tables prefixed with `tbl_`
- All functions use `LANGUAGE plpgsql` unless they need compile-time validation (`LANGUAGE sql`)
- Functions that bypass RLS use `SECURITY DEFINER`
- Always `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- Always `CREATE OR REPLACE FUNCTION` (never just `CREATE FUNCTION`)

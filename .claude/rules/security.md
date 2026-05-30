---
description: Security rules that apply to all files in this project
paths:
  - "**/*"
---

# Security Rules

These rules apply to every file. Do not violate them.

## Input Sanitization

- Always call `sanitizeInput()` from `src/lib/security.ts` on any user-provided string before inserting into the database
- Do not trust values from form fields, URL params, or query strings without sanitizing first
- `sanitizeInput` trims whitespace and strips characters that could cause issues in SQL or HTML

## Error Handling — Never Expose Raw Errors

- Never pass raw error objects, `error.message`, or Supabase `PostgrestError` to `toast.error()` or any user-visible UI
- Always use `extractMessage(error)` to safely get a string from any error type
- Show only generic, user-friendly messages to the user: "Failed to create project. Please try again."
- Log the full error server-side: `console.error("[functionName]", error)`

```ts
// WRONG
toast.error(error.message)
toast.error(result.error)

// CORRECT
console.error("[createProject]", error)
toast.error("Failed to create project", { description: "Something went wrong. Please try again." })
```

## Auth — Always Validate Server-Side

- Always use `supabase.auth.getUser()` to validate sessions — never `getSession()`
- `getSession()` only reads the cookie and does not validate with Supabase's server — it can be forged
- `getUser()` makes a network call to verify the token is legitimate
- This rule applies to middleware, API routes, and any server-side auth check

## Supabase Clients — Use the Right One

- `browserSupabase` — client components and hooks only
- `createServerSupabase()` — Server Components and API routes only
- Never use `browserSupabase` in a Server Component (it relies on browser cookie access)
- Middleware has its own inline client setup (required by Next.js edge runtime)

## Environment Variables — Never Hardcode

- Never hardcode Supabase URLs or keys in source files
- Always use `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never commit `.env.local` — it is gitignored
- The anon key is safe to expose to the browser — RLS is the security layer, not key secrecy

## RLS — Every Table Must Have Policies

- Every new table must have `ALTER TABLE tbl_x ENABLE ROW LEVEL SECURITY`
- Every table must have explicit SELECT, INSERT, UPDATE, DELETE policies
- Default without a policy = no access (safe default)
- Use `is_workspace_member(workspace_id)` for read access
- Use `is_workspace_owner(workspace_id)` for write access
- Never create a policy that allows access to all authenticated users without workspace scoping

## SECURITY DEFINER Functions

- Always use fully-qualified table names: `public.tbl_workspaces`, not `tbl_workspaces`
- Functions run with a restricted `search_path` — bare table names will silently fail or throw
- Keep SECURITY DEFINER functions minimal — only the operations that genuinely need RLS bypass
- Never expose raw SQL to user input inside a SECURITY DEFINER function

## SQL Injection

- Supabase client uses parameterized queries — do not construct raw SQL strings from user input
- If writing raw SQL (e.g. in RPC functions), use `$1, $2` parameters, never string concatenation
- `sanitizeInput()` is a secondary defense — parameterized queries are the primary one

## XSS

- Do not use `dangerouslySetInnerHTML` unless the content has been sanitized
- User-provided content (project names, descriptions, annotations) must be treated as untrusted when rendering
- Sanitize before storing and again before rendering if rendering as HTML

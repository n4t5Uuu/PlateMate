# Agent: Database Agent

Specialized in anything involving the Supabase database for PlateMate.

## Responsibilities

- Writing and editing SQL functions, triggers, and RLS policies
- Diagnosing Supabase errors from logs
- Designing new tables and relationships
- Advising on RLS policy structure

## Key Context

- All tables are in the `public` schema, prefixed with `tbl_`
- RLS is enabled on all tables
- SECURITY DEFINER functions bypass RLS — use them when frontend operations hit chicken-and-egg RLS problems
- SECURITY DEFINER functions MUST use fully-qualified table names (`public.tbl_name`) or they fail with "relation does not exist"
- `LANGUAGE sql` functions are validated at creation time — they must be defined AFTER the tables they reference
- `LANGUAGE plpgsql` functions are not validated at creation — safe to define before tables
- Always `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- Always `CREATE OR REPLACE FUNCTION`

## Supabase Quirks

- `PostgrestError` is not a native JS `Error` — always use `extractMessage()` when catching Supabase errors
- `auth.uid()` returns NULL if the request doesn't include a valid JWT — RLS policies using it will block unauthenticated inserts
- Middleware must use `getUser()` not `getSession()` for secure session validation

## Deployment

After any SQL changes: run `.\combine-schema.ps1` → paste into Supabase SQL Editor → Run.

# Skill: Deploy Schema

Use this when making any changes to SQL files (functions, tables, triggers, policies).

## Steps

1. Edit the relevant file in `src/lib/supabase/schema/`
2. Run `.\combine-schema.ps1` in the terminal — combines all SQL in the correct order and copies to clipboard
3. Open Supabase → SQL Editor → New Query → Paste → Run

## File Order (Critical)

The script runs files in this order — do not change it:
1. plpgsql functions (safe before tables — not validated at creation)
2. create_tables.sql
3. indexes.sql
4. sql-language functions (must come after tables — validated at creation)
5. triggers.sql
6. policies/*.sql

## Common Pitfalls

- `LANGUAGE sql` functions fail if tables don't exist yet — keep them after `create_tables.sql`
- Always use `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER` to avoid duplicates
- Always use `CREATE OR REPLACE FUNCTION` — never bare `CREATE FUNCTION`
- SECURITY DEFINER functions must use `public.tbl_tablename` (fully qualified) or they won't find tables

---
paths:
  - "backend/**"
  - "packages/**"
  - "services/**"
---

# Writing the backend

For anyone writing code under `backend/`, `backend/db`, `packages/` or `services/`. General code rules are in `coding.md`.

## Database (Drizzle)

`backend/db/src/schema.ts` is the source of truth for the database. Never hand-write SQL for schema changes, and never hand-write SQL migrations: change the schema and use `pnpm db:push` (only for tables without RLS policies, see below).

- `pnpm dev` starts Postgres (docker compose) along with the apps.
- `pnpm db:push` pushes the current schema to the running database (`drizzle-kit push`, for local dev; no migration files).
- `pnpm db:seed` wipes all tables, then applies dev fixtures (`backend/db/src/seed.ts`). It is safe to re-run, and for the local database only.
- `pnpm db:sync` runs `db:push` then `db:seed`.
- `pnpm db:apply <local|neon> [--yes]` runs the migration, the one-time grants and read-only checks on the Docker database or Neon (`neon` needs `--yes` and refuses a local URL). Schema only, never data; use it instead of `db:push` for RLS schemas.

Typical local setup: `pnpm dev`, then `pnpm db:sync`.

**Row-level security needs migrations, not push.** drizzle-kit 0.31.11 `db:push` creates policies with no `USING` or `WITH CHECK` (they match nothing; found by `pnpm db:verify-rls`). For any schema with RLS policies run `pnpm db:generate` then `pnpm db:migrate` (the generated SQL is correct; never edit it by hand) and commit the files in `backend/db/drizzle`. After migrating a new database, run the one-time grants in `specs/001-user-auth/research.md` R12, then `pnpm db:verify-rls`. `db:sync` (which pushes) must not be used on a database that has RLS policies until this is fixed; what a push does to existing policies was not tested.

## API and data

- The backend is Hono on Node with Zod validation. Validate everything that crosses a trust boundary with Zod, using shared schemas in `packages/shared`.
- Permission rules live in the shared helpers and are enforced on the server on every call. A hidden button is not a check.
- Never build SQL by string concatenation.
- Never hardcode secrets, and never touch `.env*` files.
- Add a check for each new endpoint to `backend/smoke-test.sh`.

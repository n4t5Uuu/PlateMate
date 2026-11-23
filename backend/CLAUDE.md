# Database (Drizzle)

`backend/db/src/schema.ts` is the source of truth — never hand-write SQL for
schema changes.

- `pnpm dev` — starts Postgres (docker compose) along with the apps.
- `pnpm db:push` — push the current schema to the running database
  (`drizzle-kit push`, for local dev; no migration files).
- `pnpm db:seed` — wipe all tables, then apply dev fixtures
  (`backend/db/src/seed.ts`); safe to re-run, local database only.
- `pnpm db:sync` — `db:push` then `db:seed`.

Typical local setup: `pnpm dev`, then `pnpm db:sync`.

---
paths:
  - "backend/**"
  - "packages/**"
  - "services/**"
---

# Writing the backend

For anyone writing code under `backend/`, `backend/db`, `packages/` or `services/`. General code rules are in `coding.md`.

## Database (Drizzle)

`backend/db/src/schema.ts` is the source of truth for the database. Never hand-write SQL for schema changes, and never hand-write SQL migrations: change the schema and use `pnpm db:push`.

- `pnpm dev` starts Postgres (docker compose) along with the apps.
- `pnpm db:push` pushes the current schema to the running database (`drizzle-kit push`, for local dev; no migration files).
- `pnpm db:seed` wipes all tables, then applies dev fixtures (`backend/db/src/seed.ts`). It is safe to re-run, and for the local database only.
- `pnpm db:sync` runs `db:push` then `db:seed`.

Typical local setup: `pnpm dev`, then `pnpm db:sync`.

## API and data

- The backend is Hono on Node with Zod validation. Validate everything that crosses a trust boundary with Zod, using shared schemas in `packages/shared`.
- Permission rules live in the shared helpers and are enforced on the server on every call. A hidden button is not a check.
- Never build SQL by string concatenation.
- Never hardcode secrets, and never touch `.env*` files.
- Add a check for each new endpoint to `backend/smoke-test.sh`.

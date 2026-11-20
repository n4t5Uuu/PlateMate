import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL is Neon's pooled URL when deployed; the fallback is the local docker compose database.
const url =
  process.env.DATABASE_URL ??
  "postgresql://platemate:platemate@localhost:5432/platemate";

// Neon's pooler runs PgBouncer in transaction mode, which does not support prepared statements.
export const db = drizzle(postgres(url, { prepare: false }), { schema });

import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL is Neon's pooled URL when deployed; the fallback is the local docker compose database.
const url =
  process.env.DATABASE_URL ??
  "postgresql://platemate:platemate@localhost:5432/platemate";

// Fail fast without echoing the value: a bare `new URL` error carries the input, which includes the password.
if (!URL.canParse(url)) throw new Error("DATABASE_URL is not a valid URL.");

// Neon is reached over WebSocket so transactions work. Plain Postgres (docker) only speaks TCP, so it keeps postgres.js.
const isNeon = new URL(url).hostname.endsWith(".neon.tech");

export const db = (
  isNeon
    ? drizzleNeon({ client: new Pool({ connectionString: url }), schema })
    : drizzlePostgres(postgres(url), { schema })
) as unknown as PgDatabase<PgQueryResultHKT, typeof schema>;

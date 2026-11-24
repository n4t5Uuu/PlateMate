import { openLocalClient } from "./local-database";

const url =
  process.env.DATABASE_URL ??
  "postgresql://platemate:platemate@localhost:5432/platemate";

// The wipe below deletes every row, so only ever run it against a local database. The check runs on the host
// postgres.js resolves, not on the URL (see local-database.ts). The URL is never printed.
const sql = await openLocalClient(url);
if (!sql) {
  console.error(
    "Refusing to seed: DATABASE_URL is not a valid local database URL.",
  );
  process.exit(1);
}

// Wipe first so re-running after editing this file never creates duplicates.
const tables = await sql<
  { tablename: string }[]
>`select tablename from pg_tables where schemaname = 'public'`;
if (tables.length) {
  await sql`truncate ${sql(tables.map((t) => t.tablename))} restart identity cascade`;
}

// Add your starter data below, for example:
//   import { drizzle } from "drizzle-orm/postgres-js";
//   import { workspaces } from "./schema";
//   const db = drizzle(sql);
//   await db.insert(workspaces).values([{ name: "Demo Studio" }]);

await sql.end();
console.log(`Seeded (wiped ${tables.length} tables).`);

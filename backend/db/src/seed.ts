import postgres from "postgres";

const url =
  process.env.DATABASE_URL ??
  "postgresql://platemate:platemate@localhost:5432/platemate";

// The wipe below deletes every row, so only ever run it against a local database.
if (!["localhost", "127.0.0.1"].includes(new URL(url).hostname)) {
  console.error("Refusing to seed: DATABASE_URL is not a local database.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

// Wipe first so re-running after editing this file never creates duplicates.
const tables = await sql`select tablename from pg_tables where schemaname = 'public'`;
if (tables.length) {
  const names = tables.map((t) => `"${t.tablename}"`).join(", ");
  await sql.unsafe(`truncate ${names} restart identity cascade`);
}

// Add your starter data below, for example:
//   import { drizzle } from "drizzle-orm/postgres-js";
//   import { workspaces } from "./schema";
//   const db = drizzle(sql);
//   await db.insert(workspaces).values([{ name: "Demo Studio" }]);

await sql.end();
console.log(`Seeded (wiped ${tables.length} tables).`);

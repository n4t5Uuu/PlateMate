import { existsSync } from "node:fs";
import { basename } from "node:path";
import type postgres from "postgres";
import { isLocalConnection } from "./local-database";
import { tablesWithRlsOff } from "./verify-rls";

// Brings a database's schema up to date: the drizzle migration, then the two one-time grants the migration cannot
// hold (specs/001-user-auth/research.md R12), then read-only checks. Schema only: it never reads or writes rows.
// Run it with `pnpm db:apply <local|neon> [--yes]`. Never use `db:push` for this (it breaks RLS policies).

const LOCAL_URL = "postgresql://platemate:platemate@localhost:5432/platemate";
const USAGE = `Usage: pnpm db:apply <local|neon> [--yes]
  local  the Docker database (ignores .env.local)
  neon   DATABASE_URL_UNPOOLED from .env.local; refuses a local database and needs --yes`;

export type Target =
  | { ok: true; url: string; host: string; label: string }
  | { ok: false; error: string };

/** What postgres.js resolved for a URL, or undefined when the URL is unusable. Injected so tests need no ESM import. */
export type Inspect = (
  url: string,
) => Promise<{ host: string; local: boolean } | undefined>;

/**
 * Turns argv (without node and the script) and the environment into the database to touch, or a refusal.
 * `local` ignores the environment; `neon` needs `--yes` and a non-local URL. The label never holds credentials.
 */
export async function resolveTarget(
  argv: readonly string[],
  env: Readonly<Record<string, string | undefined>>,
  inspect: Inspect,
): Promise<Target> {
  const refuse = (error: string): Target => ({ ok: false, error });
  const args = argv.filter((a) => a !== "--yes");
  const yes = argv.length - args.length === 1;
  if (args.length !== 1 || argv.length - args.length > 1) return refuse(USAGE);

  if (args[0] === "local")
    return {
      ok: true,
      url: LOCAL_URL,
      host: "localhost",
      label: "the local Docker database (localhost)",
    };
  if (args[0] !== "neon") return refuse(USAGE);

  if (!yes)
    return refuse(
      "Refusing: neon changes a shared database. Add --yes to confirm.",
    );
  // The direct URL, as drizzle.config.ts does: migrations cannot run through Neon's pooler.
  const url = env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL;
  if (!url)
    return refuse(
      "Refusing: neither DATABASE_URL_UNPOOLED nor DATABASE_URL is set.",
    );
  const info = await inspect(url);
  if (!info) return refuse("Refusing: the database URL is not valid.");
  if (info.local)
    return refuse(
      "Refusing: the database URL points at a local database; use `pnpm db:apply local`.",
    );
  const branch = env.NEON_BRANCH ? ` (branch ${env.NEON_BRANCH})` : "";
  return {
    ok: true,
    url,
    host: info.host,
    label: `the Neon database at ${info.host}${branch}`,
  };
}

const inspectUrl: Inspect = async (url) => {
  // Loaded here, not at the top: postgres is ESM-only and the Jest test imports this file for resolveTarget.
  const { default: connect } = await import("postgres");
  let sql: postgres.Sql;
  try {
    sql = connect(url, { max: 1 }); // lazy: does not connect
  } catch {
    return undefined;
  }
  const info = {
    host: sql.options.host.join(","),
    local: isLocalConnection(sql.options),
  };
  await sql.end();
  return info;
};

type Check = { name: string; ok: boolean };

// Static text so it needs no `unsafe`; apply.test.ts checks both stay equal to what verify-rls tells people to run.
export const grantPrivileges = (sql: postgres.ISql) =>
  sql`grant select, insert, update on users to platemate_app`;
export const grantMembership = (sql: postgres.ISql) =>
  sql`grant platemate_app to current_user with set true`;

/**
 * The SQLSTATE or system code of a failure, never its message: an auth failure names the database user.
 * drizzle wraps the driver error, so the code lives on `cause`.
 */
export function failureCode(error: unknown): string {
  const read = (e: unknown) =>
    typeof e === "object" && e !== null
      ? (e as { code?: unknown }).code
      : undefined;
  const code =
    read((error as { cause?: unknown } | null)?.cause) ?? read(error);
  return typeof code === "string" && /^[A-Z0-9_]{1,40}$/.test(code)
    ? code
    : "unknown";
}

async function migrateAndGrant(url: string, step: { current: string }) {
  const [{ default: connect }, { drizzle }, { migrate }] = await Promise.all([
    import("postgres"),
    import("drizzle-orm/postgres-js"),
    import("drizzle-orm/postgres-js/migrator"),
  ]);
  // Notices ("role X already a member") name the database user, so they are not printed.
  const sql = connect(url, { max: 1, onnotice: () => undefined });
  try {
    step.current = "migration";
    await migrate(drizzle(sql), { migrationsFolder: "./drizzle" }); // cwd is backend/db, as in drizzle.config.ts

    step.current = "grants";
    await grantPrivileges(sql);
    await grantMembership(sql);

    step.current = "checks";
    const tables = await sql<{ relname: string; relrowsecurity: boolean }[]>`
      select c.relname, c.relrowsecurity from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p')`;
    // Role and table are looked up by oid so a missing one gives null instead of an error.
    const [r] = await sql<
      Record<
        | "usersExists"
        | "roleExists"
        | "select"
        | "insert"
        | "update"
        | "delete",
        boolean | null
      >[]
    >`
      with t as (
        select to_regclass('public.users')::oid as users,
               (select oid from pg_roles where rolname = 'platemate_app') as role)
      select users is not null as "usersExists", role is not null as "roleExists",
             has_table_privilege(role, users, 'select') as "select",
             has_table_privilege(role, users, 'insert') as "insert",
             has_table_privilege(role, users, 'update') as "update",
             has_table_privilege(role, users, 'delete') as "delete"
      from t`;
    const checks: Check[] = [
      { name: "users exists", ok: !!r.usersExists },
      {
        name: "row-level security is on for every public table",
        ok: tables.length > 0 && tablesWithRlsOff(tables).length === 0,
      },
      { name: "role platemate_app exists", ok: !!r.roleExists },
      {
        name: "platemate_app has select, insert and update on users",
        ok: !!(r.select && r.insert && r.update),
      },
      {
        name: "platemate_app cannot delete from users",
        ok: r.delete === false,
      },
    ];
    return checks;
  } finally {
    await sql.end();
  }
}

async function main(): Promise<number> {
  const target = await resolveTarget(
    process.argv.slice(2),
    process.env,
    inspectUrl,
  );
  if (!target.ok) {
    console.error(target.error);
    return 1;
  }
  if (!existsSync("./drizzle/meta/_journal.json")) {
    console.error(
      "Refusing: ./drizzle/meta/_journal.json not found. Run this through `pnpm db:apply` (it must run in backend/db).",
    );
    return 1;
  }
  console.log(`Applying the schema to ${target.label}.`);

  const step = { current: "connect" };
  let checks: Check[];
  try {
    checks = await migrateAndGrant(target.url, step);
  } catch (error) {
    // Only the code: the error object and message can carry the host, the user name or the password.
    console.error(
      `FAIL the ${step.current} step (error code ${failureCode(error)}).`,
    );
    return 1;
  }
  for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"} ${c.name}`);
  return checks.every((c) => c.ok) ? 0 : 1;
}

// Only when run as a script, so the Jest test can import resolveTarget without connecting.
if (basename(process.argv[1] ?? "") === "apply.ts") {
  main().then(
    (code) => process.exit(code),
    (error: { name?: string; code?: string }) => {
      console.error(
        `db:apply crashed: ${error.code ?? error.name ?? "unknown error"}`,
      );
      process.exit(1);
    },
  );
}

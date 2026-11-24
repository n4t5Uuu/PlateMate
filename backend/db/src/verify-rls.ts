import { basename } from "node:path";
import type postgres from "postgres";
import { openLocalClient } from "./local-database";

// The always-RLS gate (specs/001-user-auth/data-model.md). Local database only. Everything the checks write happens
// in one transaction that is always rolled back, so the database is left unchanged. Run it with `pnpm db:verify-rls`.

type Check = { name: string; ok: boolean; detail?: string };
type Tx = postgres.TransactionSql;

const PRIVILEGES = ["select", "insert", "update"] as const;
const GRANT_PRIVILEGES = `grant ${PRIVILEGES.join(", ")} on users to platemate_app;`;

/** Names of the tables whose row-level security is switched off. */
export function tablesWithRlsOff(
  tables: { relname: string; relrowsecurity: boolean }[],
): string[] {
  return tables.filter((t) => !t.relrowsecurity).map((t) => t.relname);
}

// Thrown after the checks to roll the transaction back; never an error.
class Rollback extends Error {}

const isDenied = (error: unknown) =>
  (error as { code?: string }).code === "42501";

// Runs `fn` in a savepoint and reports whether Postgres refused it (RLS violation or missing privilege).
// An error of any other kind is a real problem and propagates.
async function wasDenied(tx: Tx, fn: (tx: Tx) => PromiseLike<unknown>) {
  try {
    await tx.savepoint(async (sp) => void (await fn(sp)));
    return false;
  } catch (error) {
    if (isDenied(error)) return true;
    throw error;
  }
}

// An update or delete that touches no row counts as refused, as does a privilege error.
async function changedNothing(
  tx: Tx,
  statement: (tx: Tx) => PromiseLike<readonly unknown[]>,
) {
  let changed = 0;
  const denied = await wasDenied(tx, async (sp) => {
    changed = (await statement(sp)).length;
  });
  return denied || changed === 0;
}

const setUser = (tx: Tx, clerkUserId: string) =>
  tx`select set_config('app.clerk_user_id', ${clerkUserId}, true)`;

async function runChecks(tx: Tx, checks: Check[]) {
  const add = (name: string, ok: boolean, detail?: string) =>
    checks.push({ name, ok, detail });

  const tables = await tx<{ relname: string; relrowsecurity: boolean }[]>`
    select c.relname, c.relrowsecurity from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')`;
  const rlsOff = tablesWithRlsOff(tables);
  add(
    "row-level security is on for every table in the public schema",
    rlsOff.length === 0,
    `RLS is switched off on: ${rlsOff.join(", ")}`,
  );

  // Preconditions, as the owner. Without them the checks below would pass or fail for the wrong reason.
  const [{ roleExists, usersExists }] = await tx<
    { roleExists: boolean; usersExists: boolean }[]
  >`select exists (select 1 from pg_roles where rolname = 'platemate_app') as "roleExists",
           to_regclass('public.users') is not null as "usersExists"`;
  if (!roleExists || !usersExists) {
    add(
      "platemate_app and public.users exist",
      false,
      "run `pnpm db:push` first",
    );
    return;
  }
  const [granted] = await tx<Record<(typeof PRIVILEGES)[number], boolean>[]>`
    select has_table_privilege('platemate_app', 'public.users', 'select') as "select",
           has_table_privilege('platemate_app', 'public.users', 'insert') as "insert",
           has_table_privilege('platemate_app', 'public.users', 'update') as "update"`;
  const missing = PRIVILEGES.filter((privilege) => !granted[privilege]);
  add(
    "platemate_app has select, insert and update on users",
    missing.length === 0,
    `missing ${missing.join(", ")}; as the database owner run once: ${GRANT_PRIVILEGES}`,
  );
  const [{ grantMembership }] = await tx<{ grantMembership: string }[]>`
    select format('grant platemate_app to %I with set true;', current_user) as "grantMembership"`;
  const canAssume = !(await wasDenied(
    tx,
    (sp) => sp`set local role platemate_app`,
  ));
  add(
    "the owner can assume platemate_app",
    canAssume,
    `as the database owner run once: ${grantMembership}`,
  );
  if (missing.length > 0 || !canAssume) return;

  // The probe above left the role assumed. Back to the owner to write two people (the owner bypasses RLS);
  // everything is rolled back at the end.
  await tx`reset role`;
  await tx`insert into users (clerk_user_id, email, updated_at) values
    ('verify_rls_a', 'verify-rls-a@example.invalid', now()),
    ('verify_rls_b', 'verify-rls-b@example.invalid', now())`;

  await tx`set local role platemate_app`;

  const [{ visible }] = await tx<{ visible: number }[]>`
    select count(*)::int as visible from users`;
  add("no context: no rows are visible", visible === 0, `${visible} rows seen`);

  await setUser(tx, "verify_rls_a");
  const seen = await tx<
    { clerk_user_id: string }[]
  >`select clerk_user_id from users`;
  add(
    "a person sees only their own row",
    seen.length === 1 && seen[0].clerk_user_id === "verify_rls_a",
    `saw ${seen.length} rows`,
  );

  add(
    "a person cannot insert another person's row",
    await wasDenied(
      tx,
      (sp) => sp`insert into users (clerk_user_id, email, updated_at)
        values ('verify_rls_c', 'verify-rls-c@example.invalid', now())`,
    ),
  );
  add(
    "a person cannot update another person's row",
    await changedNothing(
      tx,
      (sp) =>
        sp`update users set name = 'changed' where clerk_user_id = 'verify_rls_b' returning 1`,
    ),
  );
  // The check above can pass only because the row is invisible; the person's own row is visible, so this one cannot.
  add(
    "a person cannot update their own row (only the sync actor can)",
    await changedNothing(
      tx,
      (sp) =>
        sp`update users set name = 'changed' where clerk_user_id = 'verify_rls_a' returning 1`,
    ),
  );
  // Proves the missing privilege layer (42501 counts as denied), not the missing delete policy.
  add(
    "nothing can be deleted",
    await changedNothing(tx, (sp) => sp`delete from users returning 1`),
  );

  await tx`select set_config('app.actor', 'clerk-sync', true)`;
  add(
    "the sync actor can upsert",
    !(await wasDenied(
      tx,
      (sp) => sp`insert into users (clerk_user_id, email, name, updated_at)
        values ('verify_rls_a', 'verify-rls-a@example.invalid', 'synced', now()),
               ('verify_rls_c', 'verify-rls-c@example.invalid', 'synced', now())
        on conflict (clerk_user_id) do update set name = excluded.name`,
    )),
  );
  const [{ synced, untouched }] = await tx<
    { synced: number; untouched: number }[]
  >`
    select count(*) filter (where name = 'synced')::int as synced,
           count(*) filter (where clerk_user_id = 'verify_rls_b' and name is null)::int as untouched
    from users where clerk_user_id like 'verify_rls_%'`;
  add(
    "the upsert wrote the new and the existing row, and the earlier refused update changed nothing",
    synced === 2 && untouched === 1,
    `synced ${synced}, untouched ${untouched}`,
  );
}

async function main(): Promise<number> {
  const url =
    process.env.DATABASE_URL ??
    "postgresql://platemate:platemate@localhost:5432/platemate";

  // The checks write (then roll back) rows, so never point this at a shared database.
  const sql = await openLocalClient(url);
  if (!sql) {
    console.error(
      "Refusing to verify RLS: DATABASE_URL is not a valid local database URL.",
    );
    return 1;
  }
  const checks: Check[] = [];
  try {
    await sql.begin(async (tx) => {
      await runChecks(tx, checks);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) {
      // Never print the error object or the URL: a connection error can carry the host and credentials.
      const e = error as { name?: string; message?: string; code?: string };
      checks.push({
        name: "the checks ran to the end",
        ok: false,
        detail:
          e.name === "PostgresError"
            ? e.message
            : `unexpected error ${e.code ?? e.name ?? ""}`,
      });
    }
  } finally {
    await sql.end();
  }

  for (const c of checks) {
    console.log(c.ok ? `PASS ${c.name}` : `FAIL ${c.name}: ${c.detail ?? ""}`);
  }
  const failed = checks.filter((c) => !c.ok).length;
  console.log(
    failed === 0
      ? "RLS verified (rolled back, database unchanged)."
      : `${failed} check(s) failed.`,
  );
  return failed === 0 ? 0 : 1;
}

// Only when run as a script, so the Jest test can import the pure functions above without connecting.
if (basename(process.argv[1] ?? "") === "verify-rls.ts") {
  main().then(
    (code) => process.exit(code),
    (error: { name?: string; code?: string }) => {
      // Never print the error object: it can carry the host and credentials.
      console.error(
        `RLS verification crashed: ${error.code ?? error.name ?? "unknown error"}`,
      );
      process.exit(1);
    },
  );
}

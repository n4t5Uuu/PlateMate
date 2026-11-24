import type postgres from "postgres";

// The local-only guard shared by every script that writes to or wipes the database (seed.ts, verify-rls.ts).

/**
 * True only when every host postgres.js will connect to is exactly localhost or 127.0.0.1 and no `hostaddr` is set.
 * Takes postgres.js's resolved options, not the URL: it parses URLs its own way (`?host=` and `#@` can override the
 * authority), so only its result says where a connection would go.
 */
export function isLocalConnection(options: {
  host: readonly string[];
  connection: Record<string, unknown>;
}): boolean {
  return (
    options.host.length > 0 &&
    options.host.every((h) => h === "localhost" || h === "127.0.0.1") &&
    !("hostaddr" in options.connection)
  );
}

/**
 * Builds the client (lazy, it does not connect) and returns it only if it would connect to the local machine.
 * Returns undefined for a non-local or unparsable URL; nothing is queried and the URL is never printed.
 */
export async function openLocalClient(url: string) {
  // Loaded here, not at the top: postgres is ESM-only and the Jest test imports this file for its pure functions.
  const { default: connect } = await import("postgres");
  let sql: postgres.Sql | undefined;
  try {
    sql = connect(url, { max: 1 });
  } catch {
    return undefined;
  }
  if (isLocalConnection(sql.options)) return sql;
  await sql.end();
  return undefined;
}

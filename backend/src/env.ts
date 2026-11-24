import { z } from "zod";

// Fixed messages on purpose: Zod's defaults can echo the input, and these values are secrets.
const required = z
  .string({ error: "is missing" })
  .trim()
  .min(1, { error: "is empty" });

// The one APP_URL rule, shared with the CORS setup. A blank value counts as missing.
const appUrl = z
  .string({ error: "is missing" })
  .trim()
  .min(1, { error: "is missing" })
  .pipe(z.url({ protocol: /^https?$/, error: "is not a valid http(s) URL" }));

const envSchema = z.object({
  CLERK_PUBLISHABLE_KEY: required,
  CLERK_SECRET_KEY: required,
  CLERK_WEBHOOK_SIGNING_SECRET: required,
  APP_URL: appUrl,
});

export type Env = z.infer<typeof envSchema>;

function parseOrThrow<S extends z.ZodType>(
  schema: S,
  source: Record<string, string | undefined>,
): z.infer<S> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const problems = result.error.issues.map(
    (issue) => `${issue.path.join(".")} ${issue.message}`,
  );
  throw new Error(`Invalid environment variables: ${problems.join("; ")}`);
}

/** Validates the variables the auth code needs. The error names each bad variable and never prints a value. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  return parseOrThrow(envSchema, source);
}

/** Validates APP_URL alone, so the CORS setup does not need the Clerk keys. Same rule and errors as `parseEnv`. */
export function parseAppUrl(value: string | undefined): string {
  return parseOrThrow(z.object({ APP_URL: appUrl }), { APP_URL: value })
    .APP_URL;
}

let cached: Env | undefined;

/** Parses process.env on first call, so importing this module never throws. Later tasks call it where they need the keys. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const databaseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: nonEmptyString,
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  DB_IDLE_TIMEOUT_MS: z.coerce.number().int().min(0).max(300_000).default(30_000),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(100).max(30_000).default(5_000),
});

export const envSchema = databaseEnvSchema.extend({
  JWT_ISSUER: nonEmptyString,
  JWT_AUDIENCE: nonEmptyString,
  JWT_ALGORITHM: z.enum(["HS256", "HS384", "HS512"]).default("HS256"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  AUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(300).max(86_400).default(900),
  AUTH_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  TURNSTILE_SECRET_KEY: nonEmptyString.optional(),
  SWIFTLINE_APP_URL: z.string().url().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: nonEmptyString.optional(),
  GOOGLE_CLIENT_SECRET: nonEmptyString.optional(),
  CRON_SECRET: nonEmptyString.optional(),
});

export type AppEnv = z.infer<typeof envSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export class EnvironmentError extends Error {
  readonly issues: z.ZodIssue[];

  constructor(issues: z.ZodIssue[]) {
    super("Environment configuration is invalid");
    this.name = "EnvironmentError";
    this.issues = issues;
  }
}

export function parseEnv(source: Record<string, string | undefined>): AppEnv {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    throw new EnvironmentError(parsed.error.issues);
  }

  return parsed.data;
}

let cachedEnv: AppEnv | undefined;
let cachedDatabaseEnv: DatabaseEnv | undefined;

export function getEnv(): AppEnv {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}

export function getDatabaseEnv(): DatabaseEnv {
  cachedDatabaseEnv ??= databaseEnvSchema.parse(process.env);
  return cachedDatabaseEnv;
}

export function resetEnvCacheForTests(): void {
  cachedEnv = undefined;
  cachedDatabaseEnv = undefined;
}

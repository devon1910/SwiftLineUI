import { Pool, type PoolConfig } from "pg";

import { getDatabaseEnv, type DatabaseEnv } from "@/lib/config";

const globalForSwiftLine = globalThis as typeof globalThis & {
  swiftLineDbPool?: Pool;
};

export type DatabaseConfig = Pick<
  DatabaseEnv,
  "DATABASE_URL" | "DB_POOL_MAX" | "DB_IDLE_TIMEOUT_MS" | "DB_CONNECTION_TIMEOUT_MS"
>;

export function createPoolConfig(config: DatabaseConfig): PoolConfig {
  return {
    connectionString: config.DATABASE_URL,
    max: config.DB_POOL_MAX,
    idleTimeoutMillis: config.DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT_MS,
  };
}

export function createDbPool(config: DatabaseConfig): Pool {
  return new Pool(createPoolConfig(config));
}

export function getDbPool(): Pool {
  globalForSwiftLine.swiftLineDbPool ??= createDbPool(getDatabaseEnv());
  return globalForSwiftLine.swiftLineDbPool;
}

export async function closeDbPool(): Promise<void> {
  const pool = globalForSwiftLine.swiftLineDbPool;

  if (!pool) {
    return;
  }

  globalForSwiftLine.swiftLineDbPool = undefined;
  await pool.end();
}

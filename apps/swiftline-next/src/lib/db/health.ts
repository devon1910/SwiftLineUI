import { getDbPool } from "./pool";

export type DatabaseHealth = {
  status: "up" | "down";
  latencyMs: number;
};

type Queryable = {
  query: (query: string) => Promise<unknown>;
};

export async function checkDatabase(pool: Queryable = getDbPool()): Promise<DatabaseHealth> {
  const startedAt = performance.now();

  try {
    await pool.query("SELECT 1");
    return {
      status: "up",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return {
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }
}

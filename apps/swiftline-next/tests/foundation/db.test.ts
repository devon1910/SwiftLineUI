import { describe, expect, it } from "vitest";

import { checkDatabase } from "../../src/lib/db";
import { createPoolConfig } from "../../src/lib/db/pool";

describe("database foundation", () => {
  it("creates a bounded pool configuration", () => {
    expect(createPoolConfig({
      DATABASE_URL: "postgresql://swiftline:password@localhost:5432/swiftline",
      DB_CONNECTION_TIMEOUT_MS: 5_000,
      DB_IDLE_TIMEOUT_MS: 30_000,
      DB_POOL_MAX: 10,
    })).toEqual({
      connectionString: "postgresql://swiftline:password@localhost:5432/swiftline",
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      max: 10,
    });
  });

  it("reports a successful readiness query", async () => {
    const query = async (sql: string) => {
      expect(sql).toBe("SELECT 1");
      return { rows: [{ ok: 1 }] };
    };

    await expect(checkDatabase({ query })).resolves.toMatchObject({ status: "up" });
  });

  it("does not expose database errors in the health result", async () => {
    const query = async () => {
      throw new Error("password should not be returned");
    };

    await expect(checkDatabase({ query })).resolves.toMatchObject({ status: "down" });
    await expect(checkDatabase({ query })).resolves.not.toHaveProperty("error");
  });
});

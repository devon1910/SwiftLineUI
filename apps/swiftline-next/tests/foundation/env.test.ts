import { describe, expect, it } from "vitest";

import { EnvironmentError, parseEnv } from "../../src/lib/config/env";

const validEnv = {
  DATABASE_URL: "postgresql://swiftline:password@localhost:5432/swiftline",
  JWT_AUDIENCE: "swiftline-web",
  JWT_ISSUER: "swiftline-api",
  JWT_SECRET: "a-development-secret-that-is-at-least-32-chars",
};

describe("environment configuration", () => {
  it("parses defaults and the legacy JWT contract", () => {
    expect(parseEnv(validEnv)).toMatchObject({
      DB_CONNECTION_TIMEOUT_MS: 5_000,
      DB_IDLE_TIMEOUT_MS: 30_000,
      DB_POOL_MAX: 10,
      JWT_ALGORITHM: "HS256",
      JWT_AUDIENCE: "swiftline-web",
      JWT_ISSUER: "swiftline-api",
    });
  });

  it("rejects missing required configuration", () => {
    expect(() => parseEnv({})).toThrow(EnvironmentError);
  });

  it("rejects unsafe or invalid pool settings", () => {
    expect(() => parseEnv({
      ...validEnv,
      DB_POOL_MAX: "51",
      JWT_SECRET: "too-short",
    })).toThrow(EnvironmentError);
  });
});

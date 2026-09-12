import { describe, expect, it } from "vitest";
import { resetEnvCacheForTests } from "../../src/lib/config/env";
import { handleLogin, handleRefresh } from "../../src/modules/auth/routes";

const env = { DATABASE_URL: "postgresql://test:test@localhost/test", JWT_AUDIENCE: "swiftline-web", JWT_ISSUER: "swiftline-api", JWT_SECRET: "a-development-secret-that-is-at-least-32-chars" };
Object.assign(process.env, env);
resetEnvCacheForTests();

describe("auth route validation", () => {
  it("rejects malformed login JSON", async () => {
    const response = await handleLogin(new Request("https://www.theswiftline.com/api/v1/Auth/Login", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ status: false });
  });

  it("rejects a malformed refresh token", async () => {
    const response = await handleRefresh(new Request("https://www.theswiftline.com/api/v1/Auth/RefreshToken", { method: "POST", body: JSON.stringify({ refreshToken: "short" }) }));
    expect(response.status).toBe(401);
  });
});

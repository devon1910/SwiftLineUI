import { describe, expect, it } from "vitest";
import { resetEnvCacheForTests } from "../../src/lib/config/env";
import { handleLogin, handleRefresh, handleSignup } from "../../src/modules/auth/routes";

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

  it("processes the email outbox immediately after creating an account", async () => {
    let processed = false;
    const response = await handleSignup(new Request("https://www.theswiftline.com/api/v1/Auth/Signup", {
      method: "POST",
      body: JSON.stringify({
        email: "new-user@example.com",
        password: "secure1!",
        fullName: "New User",
        hasAgreedToTermsOfServiceAndPrivacyPolicy: true,
      }),
    }), {
      signupUser: async () => true,
      processEmails: async () => {
        processed = true;
        return { processed: 1, activeRun: false };
      },
    });

    expect(response.status).toBe(200);
    expect(processed).toBe(true);
    expect(await response.json()).toMatchObject({ status: true, data: { status: true } });
  });

  it("keeps a created account successful when immediate delivery fails", async () => {
    const response = await handleSignup(new Request("https://www.theswiftline.com/api/v1/Auth/Signup", {
      method: "POST",
      body: JSON.stringify({
        email: "queued-user@example.com",
        password: "secure1!",
        fullName: "Queued User",
        hasAgreedToTermsOfServiceAndPrivacyPolicy: true,
      }),
    }), {
      signupUser: async () => true,
      processEmails: async () => {
        throw new Error("SMTP unavailable");
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: true, data: { status: true } });
  });
});

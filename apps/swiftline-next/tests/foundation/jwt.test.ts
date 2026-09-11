import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import { getOptionalAuth, verifyAccessToken } from "../../src/lib/auth";
import type { JwtConfig } from "../../src/lib/auth";

const config: JwtConfig = {
  JWT_ALGORITHM: "HS256",
  JWT_AUDIENCE: "swiftline-web",
  JWT_ISSUER: "swiftline-api",
  JWT_SECRET: "a-development-secret-that-is-at-least-32-chars",
};

const key = new TextEncoder().encode(config.JWT_SECRET);

async function createToken(overrides: Partial<{
  audience: string;
  expirationTime: string | number;
  issuer: string;
  subject: string;
}> = {}) {
  return new SignJWT({
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": overrides.subject ?? "user-123",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(overrides.issuer ?? config.JWT_ISSUER)
    .setAudience(overrides.audience ?? config.JWT_AUDIENCE)
    .setSubject(overrides.subject ?? "user-123")
    .setIssuedAt()
    .setExpirationTime(overrides.expirationTime ?? "1h")
    .sign(key);
}

describe("JWT foundation", () => {
  it("returns a subject only after verifying a compatible token", async () => {
    const identity = await verifyAccessToken(await createToken(), config);

    expect(identity?.subject).toBe("user-123");
  });

  it.each([
    ["wrong issuer", { issuer: "other-issuer" }],
    ["wrong audience", { audience: "other-audience" }],
    ["expired", { expirationTime: "0s" }],
  ])("treats %s as anonymous", async (_label, overrides) => {
    const identity = await verifyAccessToken(await createToken(overrides), config);

    expect(identity).toBeNull();
  });

  it("rejects a malformed or unsigned token", async () => {
    await expect(verifyAccessToken("not-a-jwt", config)).resolves.toBeNull();

    const unsigned = [
      Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url"),
      Buffer.from(JSON.stringify({ sub: "forged", exp: Math.floor(Date.now() / 1000) + 60 })).toString("base64url"),
      "",
    ].join(".");

    await expect(verifyAccessToken(unsigned, config)).resolves.toBeNull();
  });

  it("does not return a token without a subject", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(config.JWT_ISSUER)
      .setAudience(config.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(key);

    await expect(verifyAccessToken(token, config)).resolves.toBeNull();
  });

  it("returns null for missing or invalid bearer credentials on public routes", async () => {
    const missing = await getOptionalAuth(new Request("http://localhost/api/public"), config);
    const invalid = await getOptionalAuth(new Request("http://localhost/api/public", {
      headers: { authorization: "Bearer malformed" },
    }), config);

    expect(missing).toBeNull();
    expect(invalid).toBeNull();
  });
});

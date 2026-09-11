import { jwtVerify } from "jose";
import { describe, expect, it } from "vitest";
import { generateRefreshToken, hashRefreshToken, issueAccessToken } from "../../src/modules/auth/tokens";

const config = { JWT_ALGORITHM: "HS256" as const, JWT_AUDIENCE: "swiftline-web", JWT_ISSUER: "swiftline-api", JWT_SECRET: "a-development-secret-that-is-at-least-32-chars" };

describe("auth tokens", () => {
  it("issues a verifiable legacy-compatible access token", async () => {
    const token = await issueAccessToken({ id: "u1", username: "person", roles: ["User"] }, config, 600);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.JWT_SECRET), { algorithms: ["HS256"], issuer: config.JWT_ISSUER, audience: config.JWT_AUDIENCE });
    expect(payload.sub).toBe("u1");
    expect(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]).toBe("u1");
    expect(payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]).toBe("User");
  });

  it("generates random opaque refresh tokens and stable hashes", () => {
    const first = generateRefreshToken();
    expect(first).not.toBe(generateRefreshToken());
    expect(Buffer.from(first, "base64url")).toHaveLength(32);
    expect(hashRefreshToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashRefreshToken(first)).toBe(hashRefreshToken(first));
  });
});

import { pbkdf2Sync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { loginWithPassword, refreshSession, type AuthSessionRepository } from "../../src/modules/auth/service";

const config = { JWT_ALGORITHM: "HS256" as const, JWT_AUDIENCE: "swiftline-web", JWT_ISSUER: "swiftline-api", JWT_SECRET: "a-development-secret-that-is-at-least-32-chars", accessTtlSeconds: 900, refreshTtlDays: 7 };
const user = { id: "u1", email: "person@example.com", username: "person", emailConfirmed: true, roles: ["User"], passwordHash: "" };
function hash(password: string) { const salt = Buffer.alloc(16, 7); const header = Buffer.alloc(13); header[0] = 1; header.writeUInt32BE(1, 1); header.writeUInt32BE(10_000, 5); header.writeUInt32BE(16, 9); return Buffer.concat([header, salt, pbkdf2Sync(password, salt, 10_000, 32, "sha256")]).toString("base64"); }
function repository(overrides: Partial<AuthSessionRepository> = {}): AuthSessionRepository { return { findUserByEmail: vi.fn(async () => ({ ...user, passwordHash: hash("Password#9") })), createSession: vi.fn(async () => {}), rotateSession: vi.fn(async () => ({ ...user, passwordHash: hash("Password#9") })), revokeAllForUser: vi.fn(async () => {}), ...overrides }; }

describe("auth service", () => {
  it("logs in an existing Identity user and persists only a token hash", async () => {
    const repo = repository();
    const result = await loginWithPassword(repo, config, user.email, "Password#9");
    expect(result?.accessToken).toBeTruthy();
    expect(result?.refreshToken).toBeTruthy();
    expect(repo.createSession).toHaveBeenCalledWith(expect.objectContaining({ userId: "u1", refreshTokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(JSON.stringify(vi.mocked(repo.createSession).mock.calls)).not.toContain(result?.refreshToken);
  });

  it("returns no auth result for invalid credentials", async () => {
    const repo = repository();
    await expect(loginWithPassword(repo, config, user.email, "wrong")).resolves.toBeNull();
    expect(repo.createSession).not.toHaveBeenCalled();
  });

  it("rotates a refresh token and never sends the raw token to storage", async () => {
    const repo = repository();
    const result = await refreshSession(repo, config, "current-refresh-token-that-is-long-enough");
    expect(result?.refreshToken).toBeTruthy();
    expect(repo.rotateSession).toHaveBeenCalledWith(expect.objectContaining({ currentHash: expect.stringMatching(/^[a-f0-9]{64}$/), replacementHash: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(JSON.stringify(vi.mocked(repo.rotateSession).mock.calls)).not.toContain("current-refresh-token-that-is-long-enough");
  });
});

import { describe, expect, it, vi } from "vitest";
import { createAuthRepository } from "../../src/modules/auth/repository";

describe("auth repository", () => {
  it("normalizes email and joins Identity roles", async () => {
    const query = vi.fn(async () => ({ rows: [{ Id: "u1", Email: "p@example.com", UserName: "person", PasswordHash: "hash", EmailConfirmed: true, Roles: ["User"] }] }));
    const repository = createAuthRepository({ query, connect: vi.fn() } as never);
    await expect(repository.findUserByEmail(" Person@Example.com ")).resolves.toMatchObject({ id: "u1", roles: ["User"] });
    const calls = query.mock.calls as unknown[][];
    expect(calls[0][0]).toContain('LEFT JOIN public."AspNetUserRoles"');
    expect(calls[0][1]).toEqual(["PERSON@EXAMPLE.COM"]);
  });

  it("rotates under a row lock and commits the replacement link", async () => {
    const responses = [
      { rows: [] },
      { rows: [{ Id: "s1", UserId: "u1", FamilyId: "f1", ExpiresAt: new Date(Date.now() + 60_000), RotatedAt: null, RevokedAt: null, Email: "p@example.com", UserName: "person", PasswordHash: "hash", EmailConfirmed: true }] },
      { rows: [{ Roles: ["User"] }] },
      { rows: [{ Id: "s2" }] },
      { rows: [] },
      { rows: [] },
    ];
    const query = vi.fn(async () => responses.shift() ?? { rows: [] });
    const client = { query, release: vi.fn() };
    const repository = createAuthRepository({ query: vi.fn(), connect: vi.fn(async () => client) } as never);
    await expect(repository.rotateSession({ currentHash: "a".repeat(64), replacementHash: "b".repeat(64), expiresAt: new Date(Date.now() + 86_400_000) })).resolves.toMatchObject({ id: "u1" });
    const calls = query.mock.calls as unknown[][];
    expect(calls.map((call) => call[0])).toEqual(expect.arrayContaining(["BEGIN", "COMMIT"]));
    expect(calls.some((call) => String(call[0]).includes("FOR UPDATE OF s"))).toBe(true);
    expect(client.release).toHaveBeenCalledOnce();
  });

  it("revokes a token family when a rotated token is reused", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ Id: "s1", FamilyId: "f1", RotatedAt: new Date(), RevokedAt: null, ExpiresAt: new Date(Date.now() + 60_000) }] })
      .mockResolvedValue({ rows: [] });
    const client = { query, release: vi.fn() };
    const repository = createAuthRepository({ query: vi.fn(), connect: vi.fn(async () => client) } as never);
    await expect(repository.rotateSession({ currentHash: "a".repeat(64), replacementHash: "b".repeat(64), expiresAt: new Date(Date.now() + 60_000) })).resolves.toBeNull();
    const calls = query.mock.calls as unknown[][];
    expect(calls.some((call) => String(call[0]).includes("refresh-token-reuse"))).toBe(true);
    expect(calls.map((call) => call[0])).toContain("COMMIT");
  });
});

import type { JwtConfig } from "@/lib/auth";
import { verifyAspNetIdentityPassword } from "@/lib/auth";
import { generateRefreshToken, hashRefreshToken, issueAccessToken } from "./tokens";
import type { AuthResponse } from "./contracts";

export type AuthUser = {
  id: string; email: string; username: string; passwordHash: string | null;
  emailConfirmed: boolean; roles: string[];
};

export type AuthSessionRepository = {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  createSession(input: { userId: string; refreshTokenHash: string; expiresAt: Date; userAgent?: string | null; ipAddress?: string | null }): Promise<void>;
  rotateSession(input: { currentHash: string; replacementHash: string; expiresAt: Date; userAgent?: string | null; ipAddress?: string | null }): Promise<AuthUser | null>;
  revokeAllForUser(userId: string, reason: string): Promise<void>;
};

type AuthConfig = JwtConfig & { accessTtlSeconds: number; refreshTtlDays: number };

const success = (user: AuthUser, accessToken: string, refreshToken: string, message: string): AuthResponse => ({
  status: true, message, accessToken, refreshToken, userId: user.id, email: user.email,
  username: user.username, purpose: "Login", isNewUser: false,
});

export async function loginWithPassword(repository: AuthSessionRepository, config: AuthConfig, email: string, password: string, metadata: { userAgent?: string | null; ipAddress?: string | null } = {}): Promise<AuthResponse | null> {
  const user = await repository.findUserByEmail(email);
  if (!user?.passwordHash || !user.emailConfirmed || !(await verifyAspNetIdentityPassword(user.passwordHash, password))) return null;
  const refreshToken = generateRefreshToken();
  await repository.createSession({ userId: user.id, refreshTokenHash: hashRefreshToken(refreshToken), expiresAt: new Date(Date.now() + config.refreshTtlDays * 86_400_000), ...metadata });
  const accessToken = await issueAccessToken({ id: user.id, username: user.username, roles: user.roles }, config, config.accessTtlSeconds);
  return success(user, accessToken, refreshToken, "Login Successful");
}

export async function refreshSession(repository: AuthSessionRepository, config: AuthConfig, currentToken: string, metadata: { userAgent?: string | null; ipAddress?: string | null } = {}): Promise<AuthResponse | null> {
  const currentHash = hashRefreshToken(currentToken);
  const replacement = generateRefreshToken();
  const user = await repository.rotateSession({ currentHash, replacementHash: hashRefreshToken(replacement), expiresAt: new Date(Date.now() + config.refreshTtlDays * 86_400_000), ...metadata });
  if (!user) return null;
  const accessToken = await issueAccessToken({ id: user.id, username: user.username, roles: user.roles }, config, config.accessTtlSeconds);
  return success(user, accessToken, replacement, "Refresh token updated.");
}

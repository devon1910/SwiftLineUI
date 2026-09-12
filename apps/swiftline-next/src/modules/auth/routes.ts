import { getOptionalAuth } from "@/lib/auth";
import { getEnv } from "@/lib/config";
import { resultFailure, resultOk, resultResponse } from "@/lib/http";
import { failedAuthResponse, loginSchema, refreshSchema } from "./contracts";
import { createAuthRepository } from "./repository";
import { loginWithPassword, refreshSession, type AuthSessionRepository } from "./service";
import { verifyTurnstile } from "./turnstile";

type Dependencies = { repository?: AuthSessionRepository; verifyBot?: typeof verifyTurnstile };
const metadata = (request: Request) => ({
  userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
  ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
});

async function json(request: Request): Promise<unknown> { try { return await request.json(); } catch { return null; } }

export async function handleLogin(request: Request, dependencies: Dependencies = {}) {
  const parsed = loginSchema.safeParse(await json(request));
  if (!parsed.success) return resultResponse(resultFailure("Invalid login request.", 400, failedAuthResponse("Invalid login request.")));
  const env = getEnv();
  if (!env.TURNSTILE_SECRET_KEY) return resultResponse(resultFailure("Authentication is not configured.", 503, failedAuthResponse("Authentication is not configured.")));
  const host = (request.headers.get("x-forwarded-host") ?? new URL(request.url).hostname).split(":")[0];
  const botOk = await (dependencies.verifyBot ?? verifyTurnstile)({ secret: env.TURNSTILE_SECRET_KEY, token: parsed.data.turnstileToken, remoteIp: metadata(request).ipAddress, expectedHostname: host });
  if (!botOk) return resultResponse(resultFailure("Security verification failed.", 400, failedAuthResponse("Security verification failed.")));
  const auth = await loginWithPassword(dependencies.repository ?? createAuthRepository(), { ...env, accessTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS, refreshTtlDays: env.AUTH_REFRESH_TOKEN_TTL_DAYS }, parsed.data.email, parsed.data.password, metadata(request));
  if (!auth) return resultResponse(resultFailure("Invalid user name or password.", 400, failedAuthResponse("Invalid user name or password.")));
  return resultResponse(resultOk(auth, auth.message));
}

export async function handleRefresh(request: Request, dependencies: Dependencies = {}) {
  const parsed = refreshSchema.safeParse(await json(request));
  if (!parsed.success) return resultResponse(resultFailure("Invalid or expired token.", 401, failedAuthResponse("Invalid or expired token.")));
  const env = getEnv();
  const auth = await refreshSession(dependencies.repository ?? createAuthRepository(), { ...env, accessTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS, refreshTtlDays: env.AUTH_REFRESH_TOKEN_TTL_DAYS }, parsed.data.refreshToken, metadata(request));
  if (!auth) return resultResponse(resultFailure("Invalid or expired token.", 401, failedAuthResponse("Invalid or expired token.")));
  return resultResponse(resultOk(auth, auth.message));
}

export async function handleLogout(request: Request, dependencies: Dependencies = {}) {
  const identity = await getOptionalAuth(request);
  if (!identity) return resultResponse(resultFailure("Unauthorized.", 401, false));
  await (dependencies.repository ?? createAuthRepository()).revokeAllForUser(identity.subject, "logout");
  return resultResponse(resultOk(true, "Logout successful."));
}

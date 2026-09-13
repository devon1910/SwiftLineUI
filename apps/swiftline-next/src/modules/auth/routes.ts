import { getOptionalAuth } from "@/lib/auth";
import { getEnv } from "@/lib/config";
import { resultFailure, resultOk, resultResponse } from "@/lib/http";
import { failedAuthResponse, loginSchema, refreshSchema, signupSchema, verificationSchema } from "./contracts";
import { signup, verifyEmail } from "./registration";
import { createAuthRepository } from "./repository";
import { loginWithPassword, refreshSession, type AuthSessionRepository } from "./service";
import { processPendingEmails } from "@/modules/email/cron";

type Dependencies = { repository?: AuthSessionRepository };
const metadata = (request: Request) => ({
  userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
  ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
});

async function json(request: Request): Promise<unknown> { try { return await request.json(); } catch { return null; } }

export async function handleLogin(request: Request, dependencies: Dependencies = {}) {
  const parsed = loginSchema.safeParse(await json(request));
  if (!parsed.success) return resultResponse(resultFailure("Invalid login request.", 400, failedAuthResponse("Invalid login request.")));
  const env = getEnv();
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

export async function handleSignup(request: Request, dependencies: Dependencies = {}) {
  const parsed = signupSchema.safeParse(await json(request));
  if (!parsed.success) return resultResponse(resultFailure("Invalid signup request.", 400, failedAuthResponse("Invalid signup request.")));
  const created = await signup({ email: parsed.data.email, password: parsed.data.password, fullName: parsed.data.fullName, agreed: true });
  if (created) {
    try {
      await processPendingEmails();
    } catch (error) {
      console.error("Immediate verification email delivery failed; queued retry remains available.", error);
    }
  }
  const message = "If this address can be registered, a verification email has been queued.";
  return resultResponse(resultOk({ status: Boolean(created), message }, message));
}

export async function handleVerifyEmail(request: Request) {
  const parsed = verificationSchema.safeParse(await json(request));
  if (!parsed.success) return resultResponse(resultFailure("Invalid or expired verification link.", 400, failedAuthResponse("Invalid or expired verification link.")));
  const auth = await verifyEmail(parsed.data.token, request);
  if (!auth) return resultResponse(resultFailure("Invalid or expired verification link.", 400, failedAuthResponse("Invalid or expired verification link.")));
  return resultResponse(resultOk(auth, "Email verified."));
}

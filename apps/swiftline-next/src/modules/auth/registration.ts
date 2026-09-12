import { createHash, randomBytes, randomUUID } from "node:crypto";
import { hashAspNetIdentityPassword } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { getEnv } from "@/lib/config";
import { generateRefreshToken, hashRefreshToken, issueAccessToken } from "./tokens";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const randomToken = () => randomBytes(32).toString("base64url");
const validPassword = (value: string) => value.length >= 6 && /[0-9]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
const metadata = (request: Request) => ({ userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null, ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null });

async function roles(client: { query: Function }, userId: string): Promise<string[]> {
  const result = await client.query(`SELECT r."Name" FROM public."AspNetUserRoles" ur JOIN public."AspNetRoles" r ON r."Id"=ur."RoleId" WHERE ur."UserId"=$1`, [userId]);
  return result.rows.map((row: { Name: string }) => row.Name);
}

async function createSession(client: { query: Function }, userId: string, request: Request) {
  const env = getEnv(); const refreshToken = generateRefreshToken();
  await client.query(`INSERT INTO public."AuthSessions" ("UserId","RefreshTokenHash","ExpiresAt","UserAgent","IpAddress") VALUES ($1,$2,$3,$4,$5)`, [userId, hashRefreshToken(refreshToken), new Date(Date.now() + env.AUTH_REFRESH_TOKEN_TTL_DAYS * 86_400_000), metadata(request).userAgent, metadata(request).ipAddress]);
  return refreshToken;
}

async function authResponse(client: { query: Function }, user: { id: string; email: string; username: string }, request: Request, message: string) {
  const env = getEnv(); const refreshToken = await createSession(client, user.id, request);
  const accessToken = await issueAccessToken({ id: user.id, username: user.username, roles: await roles(client, user.id) }, env, env.AUTH_ACCESS_TOKEN_TTL_SECONDS);
  return { status: true, message, accessToken, refreshToken, userId: user.id, email: user.email, username: user.username, purpose: "Login", isNewUser: false };
}

export async function signup(input: { email: string; password: string; fullName: string; agreed: boolean }) {
  const email = input.email.trim().toLowerCase();
  if (!validPassword(input.password) || !input.fullName.trim() || !input.agreed) throw new Error("Invalid signup request.");
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(`SELECT "Id" FROM public."AspNetUsers" WHERE "NormalizedEmail"=$1 FOR UPDATE`, [email.toUpperCase()]);
    if (existing.rows[0]) { await client.query("ROLLBACK"); return null; }
    const role = await client.query(`SELECT "Id" FROM public."AspNetRoles" WHERE "NormalizedName"='USER' LIMIT 1`);
    if (!role.rows[0]) throw new Error("User role is not configured.");
    const id = randomUUID(); const username = `${email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 32) || "user"}_${randomUUID().slice(0, 8)}`;
    await client.query(`INSERT INTO public."AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled","AccessFailedCount","Name","FullName","IsInQueue","LastEventJoined","HasAgreedToTermsOfServiceAndPrivacyPolicy","DateCreated") VALUES ($1,$2,$3,$4,$5,FALSE,$6,$7,$8,FALSE,FALSE,FALSE,0,$9,$9,FALSE,0,TRUE,now())`, [id, username, username.toUpperCase(), email, email.toUpperCase(), await hashAspNetIdentityPassword(input.password), randomUUID(), randomUUID(), input.fullName.trim()]);
    await client.query(`INSERT INTO public."AspNetUserRoles" ("UserId","RoleId") VALUES ($1,$2)`, [id, role.rows[0].Id]);
    const token = randomToken();
    await client.query(`INSERT INTO public."EmailVerificationTokens" ("UserId","TokenHash","ExpiresAt") VALUES ($1,$2,now()+interval '24 hours')`, [id, digest(token)]);
    const link = `${getEnv().SWIFTLINE_APP_URL.replace(/\/$/, "")}/VerifyToken?token=${encodeURIComponent(token)}`;
    await client.query(`INSERT INTO public."EmailDeliveryRequests" ("RecipientEmail","RecipientUsername","EmailType","IsSent","Message","RetryCount","Subject","Link","EstimatedWait","DateCreated") VALUES ($1,$2,'Verify_Email',FALSE,$3,0,'Verify Your Email Address',$4,NULL,now())`, [email, username, "Confirm your email address to finish creating your SwiftLine account.", link]);
    await client.query("COMMIT"); return true;
  } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; } finally { client.release(); }
}

export async function verifyEmail(token: string, request: Request) {
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const tokenRow = await client.query(`SELECT t."UserId",u."Email",u."UserName" FROM public."EmailVerificationTokens" t JOIN public."AspNetUsers" u ON u."Id"=t."UserId" WHERE t."TokenHash"=$1 AND t."ConsumedAt" IS NULL AND t."ExpiresAt">now() FOR UPDATE OF t`, [digest(token)]);
    const row = tokenRow.rows[0]; if (!row) { await client.query("ROLLBACK"); return null; }
    await client.query(`UPDATE public."EmailVerificationTokens" SET "ConsumedAt"=now() WHERE "TokenHash"=$1`, [digest(token)]);
    await client.query(`UPDATE public."AspNetUsers" SET "EmailConfirmed"=TRUE WHERE "Id"=$1`, [row.UserId]);
    const auth = await authResponse(client, { id: row.UserId, email: row.Email, username: row.UserName }, request, "Email verified.");
    await client.query("COMMIT"); return auth;
  } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; } finally { client.release(); }
}

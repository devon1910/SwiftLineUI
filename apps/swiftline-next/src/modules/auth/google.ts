import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { getDbPool } from "@/lib/db";
import { getEnv } from "@/lib/config";
import { createSessionAuthResponse } from "./registration";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const opaque = () => randomBytes(32).toString("base64url");
const stateCookie = "swiftline_google_state";

function callbackUrl(request: Request) { return `${new URL(request.url).origin}/api/v1/Auth/Google/callback`; }
function redirect(path: string) { return new URL(path, getEnv().SWIFTLINE_APP_URL).toString(); }

export function beginGoogleLogin(request: Request) {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return Response.redirect(redirect("/auth?oauthError=not-configured"), 302);
  const state = opaque(); const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: callbackUrl(request), response_type: "code", scope: "openid email profile", state, prompt: "select_account" }).toString();
  const response = Response.redirect(url, 302);
  response.headers.append("Set-Cookie", `${stateCookie}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return response;
}

export async function finishGoogleLogin(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${stateCookie}=([^;]+)`))?.[1];
  if (!code || !state || !cookie || state.length !== cookie.length || !timingSafeEqual(Buffer.from(state), Buffer.from(cookie))) return Response.redirect(redirect("/auth?oauthError=invalid-state"), 302);
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return Response.redirect(redirect("/auth?oauthError=not-configured"), 302);
  const tokenResult = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: callbackUrl(request), grant_type: "authorization_code" }), signal: AbortSignal.timeout(10_000) });
  if (!tokenResult.ok) return Response.redirect(redirect("/auth?oauthError=exchange-failed"), 302);
  const token = await tokenResult.json() as { access_token?: string };
  const profileResult = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token ?? ""}` }, signal: AbortSignal.timeout(10_000) });
  const profile = await profileResult.json() as { email?: string; email_verified?: boolean; name?: string };
  if (!profileResult.ok || !profile.email || profile.email_verified !== true) return Response.redirect(redirect("/auth?oauthError=profile-failed"), 302);
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN"); const email = profile.email.toLowerCase();
    let user = (await client.query(`SELECT "Id","Email","UserName" FROM public."AspNetUsers" WHERE "NormalizedEmail"=$1 FOR UPDATE`, [email.toUpperCase()])).rows[0];
    if (!user) {
      const role = await client.query(`SELECT "Id" FROM public."AspNetRoles" WHERE "NormalizedName"='USER' LIMIT 1`); if (!role.rows[0]) throw new Error("User role is not configured.");
      const id = randomUUID(); const username = `${email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 32) || "user"}_${randomUUID().slice(0, 8)}`;
      await client.query(`INSERT INTO public."AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled","AccessFailedCount","Name","FullName","IsInQueue","LastEventJoined","HasAgreedToTermsOfServiceAndPrivacyPolicy","DateCreated") VALUES ($1,$2,$3,$4,$5,TRUE,NULL,$6,$7,FALSE,FALSE,FALSE,0,$8,$8,FALSE,0,TRUE,now())`, [id,username,username.toUpperCase(),email,email.toUpperCase(),randomUUID(),randomUUID(),profile.name?.slice(0,256) || username]);
      await client.query(`INSERT INTO public."AspNetUserRoles" ("UserId","RoleId") VALUES ($1,$2)`, [id,role.rows[0].Id]); user = { Id:id, Email:email, UserName:username };
    }
    const loginCode = opaque(); await client.query(`INSERT INTO public."OAuthLoginCodes" ("UserId","CodeHash","ExpiresAt") VALUES ($1,$2,now()+interval '5 minutes')`, [user.Id,hash(loginCode)]);
    await client.query("COMMIT"); const response = Response.redirect(`${redirect("/oauth/callback")}?code=${encodeURIComponent(loginCode)}`, 302); response.headers.append("Set-Cookie", `${stateCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`); return response;
  } catch (error) { await client.query("ROLLBACK").catch(()=>{}); throw error; } finally { client.release(); }
}

export async function exchangeGoogleCode(code: string, request: Request) {
  const client = await getDbPool().connect(); try { await client.query("BEGIN"); const result = await client.query(`SELECT c."UserId",u."Email",u."UserName" FROM public."OAuthLoginCodes" c JOIN public."AspNetUsers" u ON u."Id"=c."UserId" WHERE c."CodeHash"=$1 AND c."ConsumedAt" IS NULL AND c."ExpiresAt">now() FOR UPDATE OF c`, [hash(code)]); const row=result.rows[0]; if(!row){await client.query("ROLLBACK");return null;} await client.query(`UPDATE public."OAuthLoginCodes" SET "ConsumedAt"=now() WHERE "CodeHash"=$1`,[hash(code)]); const auth=await createSessionAuthResponse(client,{id:row.UserId,email:row.Email,username:row.UserName},request,"Google login successful."); await client.query("COMMIT"); return auth; } catch(error){await client.query("ROLLBACK").catch(()=>{});throw error;} finally{client.release();} }

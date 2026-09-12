import { getOptionalAuth } from "@/lib/auth";
import { getEnv } from "@/lib/config";
import { getDbPool } from "@/lib/db";
import { resultFailure, resultOk, resultResponse } from "@/lib/http";
import { randomUUID } from "node:crypto";
import { generateRefreshToken, hashRefreshToken, issueAccessToken } from "@/modules/auth/tokens";

const fail = (message: string, status = 400) => resultResponse(resultFailure(message, status, null));

const guestAdjectives = ["Quiet", "Bright", "Kind", "Steady", "Swift", "Golden", "Calm", "Clever"];
const guestNouns = ["Lantern", "Harbor", "Willow", "Comet", "Meadow", "River", "Cedar", "Sparrow"];

function requestedGuestName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name && name.length <= 80 ? name : null;
}

function generatedGuestName(): string {
  const adjective = guestAdjectives[Math.floor(Math.random() * guestAdjectives.length)];
  const noun = guestNouns[Math.floor(Math.random() * guestNouns.length)];
  return `${adjective} ${noun}`;
}

async function uniqueGuestName(client: { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }, requested: string | null): Promise<string> {
  const base = requested ?? generatedGuestName();
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base} ${attempt + 1}`;
    const existing = await client.query(`SELECT 1 FROM public."AspNetUsers" WHERE "NormalizedUserName"=$1 LIMIT 1`, [candidate.toUpperCase()]);
    if (!existing.rows[0]) return candidate;
  }
  return `${base} ${randomUUID().slice(0, 4)}`;
}

export async function joinQueue(request: Request, eventId: string) {
  if (!/^\d+$/.test(eventId)) return fail("eventId must be a positive integer.");
  const payload = await request.json().catch(() => null) as { displayName?: unknown } | null;
  const requestedName = requestedGuestName(payload?.displayName);
  const authenticatedActor = await getOptionalAuth(request);
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const event = await client.query(`SELECT * FROM public."Events" WHERE "Id"=$1::bigint AND "IsDeleted"=FALSE FOR UPDATE`, [eventId]);
    const queue = event.rows[0];
    if (!queue) { await client.query("ROLLBACK"); return fail("Event not found.", 404); }
    if (!queue.IsActive) { await client.query("ROLLBACK"); return fail("This queue is currently paused."); }
    if (!authenticatedActor && !queue.AllowAnonymousJoining) { await client.query("ROLLBACK"); return fail("Authentication is required to join this queue.", 401); }
    let userId = authenticatedActor?.subject;
    let guest: { id: string; username: string; refreshToken: string } | null = null;
    if (!userId) {
      const id = randomUUID();
      const username = await uniqueGuestName(client, requestedName);
      const email = `${id}@guest.swiftline.invalid`;
      const role = await client.query(`SELECT "Id" FROM public."AspNetRoles" WHERE "NormalizedName"='ANONYMOUS' LIMIT 1`);
      if (!role.rows[0]) { await client.query("ROLLBACK"); return fail("Anonymous queue access is not configured.", 503); }
      await client.query(`INSERT INTO public."AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnabled","AccessFailedCount","Name","FullName","IsInQueue","LastEventJoined","HasAgreedToTermsOfServiceAndPrivacyPolicy","DateCreated") VALUES ($1,$2,$3,$4,$5,TRUE,NULL,$6,$7,FALSE,FALSE,FALSE,0,$2,$2,FALSE,0,TRUE,now())`, [id, username, username.toUpperCase(), email, email.toUpperCase(), randomUUID(), randomUUID()]);
      await client.query(`INSERT INTO public."AspNetUserRoles" ("UserId","RoleId") VALUES ($1,$2)`, [id, role.rows[0].Id]);
      const refreshToken = generateRefreshToken();
      await client.query(`INSERT INTO public."AuthSessions" ("UserId","RefreshTokenHash","ExpiresAt","UserAgent","IpAddress") VALUES ($1,$2,$3,$4,$5)`, [id, hashRefreshToken(refreshToken), new Date(Date.now() + getEnv().AUTH_REFRESH_TOKEN_TTL_DAYS * 86_400_000), request.headers.get("user-agent")?.slice(0, 512) ?? null, request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null]);
      userId = id;
      guest = { id, username, refreshToken };
    }
    const user = await client.query(`SELECT "IsInQueue" FROM public."AspNetUsers" WHERE "Id"=$1 FOR UPDATE`, [userId]);
    if (!user.rows[0]) { await client.query("ROLLBACK"); return fail("User not found.", 401); }
    if (user.rows[0].IsInQueue) { await client.query("ROLLBACK"); return fail("You are already in a queue."); }
    if (queue.Capacity > 0 && queue.UsersInQueue >= queue.Capacity) { await client.query("ROLLBACK"); return fail("This queue has reached its capacity."); }
    const now = new Date(); const hour = now.getUTCHours() + 1; const timeOfDay = hour >= 6 && hour < 12 ? 0 : hour < 18 ? 1 : hour < 22 ? 2 : 3;
    const position = Math.ceil((queue.UsersInQueue + 1) / queue.StaffCount);
    await client.query(`INSERT INTO public."Lines" ("UserId","EventId","AvgServiceTimeWhenJoined","NumActiveServersWhenJoined","TimeWaited","TimeOfDay","DayOfWeek","EffectiveQueuePosition","Status","IsAttendedTo","IsActive","CreatedAt","DateStartedBeingAttendedTo","DateCompletedBeingAttendedTo") VALUES ($1,$2::bigint,$3,$4,0,$5,$6,$7,'pending',FALSE,TRUE,now(),now(),now())`, [userId,eventId,queue.AverageTime,queue.StaffCount,timeOfDay,now.getUTCDay(),Math.max(0,position-queue.StaffCount)]);
    await client.query(`UPDATE public."Events" SET "UsersInQueue"="UsersInQueue"+1 WHERE "Id"=$1::bigint`, [eventId]);
    await client.query(`UPDATE public."AspNetUsers" SET "IsInQueue"=TRUE,"LastEventJoined"=$1::bigint WHERE "Id"=$2`, [eventId,userId]);
    await client.query("COMMIT");
    if (!guest) return resultResponse(resultOk(true, "Joined queue successfully."));
    const env = getEnv();
    const accessToken = await issueAccessToken({ id: guest.id, username: guest.username, roles: ["Anonymous"] }, env, env.AUTH_ACCESS_TOKEN_TTL_SECONDS);
    return resultResponse(resultOk({ status: true, message: "Joined queue successfully.", accessToken, refreshToken: guest.refreshToken, userId: guest.id, username: guest.username, email: "", purpose: "Anonymous queue", isNewUser: true }, "Joined queue successfully."));
  } catch { await client.query("ROLLBACK").catch(() => {}); return fail("Unable to join the queue.", 500); } finally { client.release(); }
}

export async function getMyQueue(request: Request) {
  const actor = await getOptionalAuth(request); if (!actor) return fail("Unauthorized.", 401);
  const { rows } = await getDbPool().query(`WITH active_lines AS (SELECT l."Id",l."UserId",l."EventId",row_number() OVER (PARTITION BY l."EventId" ORDER BY l."Id") AS "actualPosition" FROM public."Lines" l WHERE l."IsActive"=TRUE AND l."IsAttendedTo"=FALSE) SELECT l."Id" AS "lineMemberId",CEIL((CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1)) / GREATEST(e."AverageTime",1)))::int AS position,CONCAT(CEIL((CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1)) / GREATEST(e."AverageTime",1)))::int,CASE WHEN CEIL((CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1)) / GREATEST(e."AverageTime",1)))::int % 100 BETWEEN 11 AND 13 THEN 'th' WHEN CEIL((CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1)) / GREATEST(e."AverageTime",1)))::int % 10=1 THEN 'st' WHEN CEIL((CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1)) / GREATEST(e."AverageTime",1)))::int % 10=2 THEN 'nd' WHEN CEIL((CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1)) / GREATEST(e."AverageTime",1)))::int % 10=3 THEN 'rd' ELSE 'th' END) AS "positionRank",e."Title" AS "eventTitle",GREATEST(0,CEIL((l."actualPosition" * e."AverageTime")::numeric / GREATEST(e."StaffCount",1))::int-e."AverageTime") AS "timeTillYourTurn",e."AverageTime" AS "averageWait",e."IsActive" AS "isNotPaused",e."StaffCount" AS "staffServing",e."AllowAutomaticSkips" AS "allowAutomaticSkips" FROM active_lines l JOIN public."Events" e ON e."Id"=l."EventId" WHERE l."UserId"=$1 LIMIT 1`, [actor.subject]);
  return resultResponse(resultOk(rows[0] ?? { position: -1, timeTillYourTurn: 0, eventTitle: "", averageWait: 0 }));
}

export async function leaveQueue(request: Request) {
  const actor = await getOptionalAuth(request); if (!actor) return fail("Unauthorized.", 401);
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const line = await client.query(`UPDATE public."Lines" SET "IsAttendedTo"=TRUE,"Status"='left',"DateCompletedBeingAttendedTo"=now() WHERE "UserId"=$1 AND "IsActive"=TRUE AND "IsAttendedTo"=FALSE RETURNING "EventId"`, [actor.subject]);
    if (!line.rows[0]) { await client.query("ROLLBACK"); return fail("You are not currently in a queue."); }
    await client.query(`UPDATE public."Events" SET "UsersInQueue"=GREATEST(0,"UsersInQueue"-1) WHERE "Id"=$1`, [line.rows[0].EventId]);
    await client.query(`UPDATE public."AspNetUsers" SET "IsInQueue"=FALSE,"LastEventJoined"=0 WHERE "Id"=$1`, [actor.subject]);
    await client.query("COMMIT"); return resultResponse(resultOk(true, "Left queue successfully."));
  } catch { await client.query("ROLLBACK").catch(() => {}); return fail("Unable to leave the queue.", 500); } finally { client.release(); }
}

async function organizer(request: Request, eventId: string) {
  const actor = await getOptionalAuth(request); if (!actor || !/^\d+$/.test(eventId)) return null;
  const check = await getDbPool().query(`SELECT 1 FROM public."Events" WHERE "Id"=$1::bigint AND "CreatedBy"=$2 AND "IsDeleted"=FALSE`, [eventId, actor.subject]);
  return check.rowCount ? actor : null;
}

export async function serveQueueMember(request: Request, eventId: string, lineId: string) {
  if (!/^\d+$/.test(lineId)) return fail("lineId must be a positive integer.");
  if (!(await organizer(request, eventId))) return fail("Forbidden.", 403);
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const line = await client.query(`UPDATE public."Lines" SET "IsAttendedTo"=TRUE,"Status"='served by Admin',"DateCompletedBeingAttendedTo"=now() WHERE "Id"=$1::bigint AND "EventId"=$2::bigint AND "IsAttendedTo"=FALSE RETURNING "UserId"`, [lineId,eventId]);
    if (!line.rows[0]) { await client.query("ROLLBACK"); return fail("Queue member is no longer active."); }
    await client.query(`UPDATE public."Events" SET "UsersInQueue"=GREATEST(0,"UsersInQueue"-1) WHERE "Id"=$1::bigint`, [eventId]);
    await client.query(`UPDATE public."AspNetUsers" SET "IsInQueue"=FALSE,"LastEventJoined"=0 WHERE "Id"=$1`, [line.rows[0].UserId]);
    await client.query("COMMIT"); return resultResponse(resultOk(true, "Queue member served."));
  } catch { await client.query("ROLLBACK").catch(() => {}); return fail("Unable to serve queue member.",500); } finally { client.release(); }
}

export async function setQueueActivity(request: Request, eventId: string) {
  if (!(await organizer(request,eventId))) return fail("Forbidden.",403);
  const payload = await request.json().catch(() => null) as { isActive?: unknown } | null;
  if (!payload || typeof payload.isActive !== "boolean") return fail("isActive must be a boolean.");
  await getDbPool().query(`UPDATE public."Events" SET "IsActive"=$1 WHERE "Id"=$2::bigint`,[payload.isActive,eventId]);
  return resultResponse(resultOk(true,"Queue status updated."));
}

export async function getOrganizerQueue(request: Request,eventId: string) {
  if (!(await organizer(request,eventId))) return fail("Forbidden.",403);
  const { rows } = await getDbPool().query(`SELECT l."Id" AS id,l."CreatedAt" AS "createdAt",l."IsAttendedTo" AS "isAttendedTo",l."Status" AS status,l."TimeWaited" AS "timeWaited",u."UserName" AS "username" FROM public."Lines" l JOIN public."AspNetUsers" u ON u."Id"=l."UserId" WHERE l."EventId"=$1::bigint ORDER BY l."Id" ASC`,[eventId]);
  return resultResponse(resultOk(rows));
}

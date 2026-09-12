import { getOptionalAuth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { resultFailure, resultOk, resultResponse } from "@/lib/http";

const fail = (message: string, status = 400) => resultResponse(resultFailure(message, status, null));

export async function joinQueue(request: Request, eventId: string) {
  if (!/^\d+$/.test(eventId)) return fail("eventId must be a positive integer.");
  const actor = await getOptionalAuth(request);
  if (!actor) return fail("Authentication is required to join this queue.", 401);
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const event = await client.query(`SELECT * FROM public."Events" WHERE "Id"=$1::bigint AND "IsDeleted"=FALSE FOR UPDATE`, [eventId]);
    const queue = event.rows[0];
    if (!queue) { await client.query("ROLLBACK"); return fail("Event not found.", 404); }
    if (!queue.IsActive) { await client.query("ROLLBACK"); return fail("This queue is currently paused."); }
    const user = await client.query(`SELECT "IsInQueue" FROM public."AspNetUsers" WHERE "Id"=$1 FOR UPDATE`, [actor.subject]);
    if (!user.rows[0]) { await client.query("ROLLBACK"); return fail("User not found.", 401); }
    if (user.rows[0].IsInQueue) { await client.query("ROLLBACK"); return fail("You are already in a queue."); }
    if (queue.Capacity > 0 && queue.UsersInQueue >= queue.Capacity) { await client.query("ROLLBACK"); return fail("This queue has reached its capacity."); }
    const now = new Date(); const hour = now.getUTCHours() + 1; const timeOfDay = hour >= 6 && hour < 12 ? 0 : hour < 18 ? 1 : hour < 22 ? 2 : 3;
    const position = Math.ceil((queue.UsersInQueue + 1) / queue.StaffCount);
    await client.query(`INSERT INTO public."Lines" ("UserId","EventId","AvgServiceTimeWhenJoined","NumActiveServersWhenJoined","TimeWaited","TimeOfDay","DayOfWeek","EffectiveQueuePosition","Status","IsAttendedTo","IsActive","CreatedAt","DateStartedBeingAttendedTo","DateCompletedBeingAttendedTo") VALUES ($1,$2::bigint,$3,$4,0,$5,$6,$7,'pending',FALSE,TRUE,now(),now(),now())`, [actor.subject,eventId,queue.AverageTime,queue.StaffCount,timeOfDay,now.getUTCDay(),Math.max(0,position-queue.StaffCount)]);
    await client.query(`UPDATE public."Events" SET "UsersInQueue"="UsersInQueue"+1 WHERE "Id"=$1::bigint`, [eventId]);
    await client.query(`UPDATE public."AspNetUsers" SET "IsInQueue"=TRUE,"LastEventJoined"=$1::bigint WHERE "Id"=$2`, [eventId,actor.subject]);
    await client.query("COMMIT");
    return resultResponse(resultOk(true, "Joined queue successfully."));
  } catch { await client.query("ROLLBACK").catch(() => {}); return fail("Unable to join the queue.", 500); } finally { client.release(); }
}

export async function getMyQueue(request: Request) {
  const actor = await getOptionalAuth(request); if (!actor) return fail("Unauthorized.", 401);
  const { rows } = await getDbPool().query(`SELECT l."Id" AS "lineMemberId",row_number() OVER (PARTITION BY l."EventId" ORDER BY l."Id") AS position,e."Title" AS "eventTitle",e."AverageTime" AS "averageWait",e."IsActive" AS "isNotPaused",e."StaffCount" AS "staffServing",e."AllowAutomaticSkips" AS "allowAutomaticSkips" FROM public."Lines" l JOIN public."Events" e ON e."Id"=l."EventId" WHERE l."UserId"=$1 AND l."IsActive"=TRUE AND l."IsAttendedTo"=FALSE LIMIT 1`, [actor.subject]);
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

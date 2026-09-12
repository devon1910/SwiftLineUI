import { z } from "zod";
import { getOptionalAuth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { resultFailure, resultOk, resultResponse } from "@/lib/http";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/);
const eventSchema = z.object({
  title: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(500),
  averageTime: z.coerce.number().int().min(0).max(1_440),
  eventStartTime: time,
  eventEndTime: time,
  capacity: z.coerce.number().int().min(1).max(100_000),
  staffCount: z.coerce.number().int().min(1).max(1_000),
  allowAnonymousJoining: z.boolean().default(false),
  allowAutomaticSkips: z.boolean().default(true),
  enableGeographicRestriction: z.boolean().default(false),
  address: z.string().trim().max(500).nullable().optional(),
  latitude: z.coerce.number().finite().nullable().optional(),
  longitude: z.coerce.number().finite().nullable().optional(),
  radiusInMeters: z.coerce.number().int().min(1).max(100_000).nullable().optional(),
}).superRefine((event, context) => {
  if (event.enableGeographicRestriction && (event.latitude === null || event.latitude === undefined || event.longitude === null || event.longitude === undefined || !event.radiusInMeters)) {
    context.addIssue({ code: "custom", message: "Location and radius are required for geographic restrictions." });
  }
});

async function body(request: Request) { try { return await request.json(); } catch { return null; } }
async function actor(request: Request) { return getOptionalAuth(request); }
function forbidden() { return resultResponse(resultFailure("Forbidden.", 403, null)); }
function unauthorized() { return resultResponse(resultFailure("Unauthorized.", 401, null)); }
function badRequest(message: string) { return resultResponse(resultFailure(message, 400, null)); }

function canOrganize(claims: Record<string, unknown>): boolean {
  const role = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((value) => value === "User" || value === "Admin");
}

export async function createOrganizerEvent(request: Request) {
  const identity = await actor(request);
  if (!identity) return unauthorized();
  if (!canOrganize(identity.claims)) return forbidden();
  const parsed = eventSchema.safeParse(await body(request));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid event.");
  const event = parsed.data;
  const db = getDbPool();
  try {
    const inserted = await db.query<{ Id: number }>(`INSERT INTO public."Events" ("Title","Description","AverageTime","AverageTimeToServeSeconds","CreatedBy","EventStartTime","EventEndTime","Capacity","StaffCount","AllowAnonymousJoining","AllowAutomaticSkips","EnableGeographicRestriction","Address","Latitude","Longitude","RadiusInMeters","UsersInQueue","IsActive","IsDeleted","CreatedAt")
      SELECT $1,$2,$3,$4,$5,$6::time,$7::time,$8,$9,$10,$11,$12,$13,$14,$15,$16,0,TRUE,FALSE,now()
      WHERE NOT EXISTS (SELECT 1 FROM public."Events" WHERE "Title" = $1 AND "IsDeleted" = FALSE)
      RETURNING "Id"`, [event.title, event.description, event.averageTime, event.averageTime * 60, identity.subject, event.eventStartTime, event.eventEndTime, event.capacity, event.staffCount, event.allowAnonymousJoining, event.allowAutomaticSkips, event.enableGeographicRestriction, event.address ?? null, event.latitude ?? null, event.longitude ?? null, event.radiusInMeters ?? null]);
    if (!inserted.rows[0]) return badRequest("An active event with this title already exists.");
    return resultResponse(resultOk(true, "Event created successfully."));
  } catch { return resultResponse(resultFailure("Unable to create event.", 500, null)); }
}

export async function listOrganizerEvents(request: Request) {
  const identity = await actor(request);
  if (!identity) return unauthorized();
  if (!canOrganize(identity.claims)) return forbidden();
  const db = getDbPool();
  const result = await db.query(`SELECT "Id" AS id,"Title" AS title,"Description" AS description,"AverageTime" AS "averageTime","EventStartTime"::text AS "eventStartTime","EventEndTime"::text AS "eventEndTime","Capacity" AS capacity,"StaffCount" AS "staffCount","AllowAnonymousJoining" AS "allowAnonymousJoining","AllowAutomaticSkips" AS "allowAutomaticSkips","EnableGeographicRestriction" AS "enableGeographicRestriction","Address" AS address,"Latitude" AS latitude,"Longitude" AS longitude,"RadiusInMeters" AS "radiusInMeters","UsersInQueue" AS "usersInQueue","IsActive" AS "isActive","IsDeleted" AS "isDeleted" FROM public."Events" WHERE "CreatedBy"=$1 ORDER BY "CreatedAt" DESC NULLS LAST,"Id" DESC`, [identity.subject]);
  return resultResponse(resultOk(result.rows));
}

export async function updateOrganizerEvent(request: Request, eventId: string) {
  const identity = await actor(request);
  if (!identity) return unauthorized();
  if (!canOrganize(identity.claims)) return forbidden();
  if (!/^\d+$/.test(eventId) || Number(eventId) < 1) return badRequest("eventId must be a positive integer.");
  const parsed = eventSchema.safeParse(await body(request));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid event.");
  const event = parsed.data;
  const db = getDbPool();
  const updated = await db.query(`UPDATE public."Events" SET "Title"=$1,"Description"=$2,"AverageTime"=$3,"AverageTimeToServeSeconds"=$4,"EventStartTime"=$5::time,"EventEndTime"=$6::time,"Capacity"=$7,"StaffCount"=$8,"AllowAnonymousJoining"=$9,"AllowAutomaticSkips"=$10,"EnableGeographicRestriction"=$11,"Address"=$12,"Latitude"=$13,"Longitude"=$14,"RadiusInMeters"=$15 WHERE "Id"=$16::bigint AND "CreatedBy"=$17 AND "IsDeleted"=FALSE`, [event.title,event.description,event.averageTime,event.averageTime*60,event.eventStartTime,event.eventEndTime,event.capacity,event.staffCount,event.allowAnonymousJoining,event.allowAutomaticSkips,event.enableGeographicRestriction,event.address ?? null,event.latitude ?? null,event.longitude ?? null,event.radiusInMeters ?? null,eventId,identity.subject]);
  if (!updated.rowCount) return forbidden();
  return resultResponse(resultOk(true, "Event updated successfully."));
}

export async function deleteOrganizerEvent(request: Request, eventId: string) {
  const identity = await actor(request);
  if (!identity) return unauthorized();
  if (!canOrganize(identity.claims)) return forbidden();
  if (!/^\d+$/.test(eventId) || Number(eventId) < 1) return badRequest("eventId must be a positive integer.");
  const result = await getDbPool().query(`UPDATE public."Events" SET "IsDeleted"=TRUE WHERE "Id"=$1::bigint AND "CreatedBy"=$2 AND "IsDeleted"=FALSE`, [eventId, identity.subject]);
  if (!result.rowCount) return forbidden();
  return resultResponse(resultOk(true, "Event deleted successfully."));
}

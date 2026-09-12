import { getDbPool } from "@/lib/db";
import type {
  EventRepository,
  PublicEventRow,
  PublicEventSearchResult,
  PublicEventSearchRow,
} from "./contracts";
import { escapeLikePattern } from "./validation";

type QueryResult<T> = { rows: T[] };
type QueryableDatabase = {
  query<T>(text: string, values?: readonly unknown[]): Promise<QueryResult<T>>;
};

async function query<T>(text: string, values: readonly unknown[]): Promise<T[]> {
  const database = getDbPool() as unknown as QueryableDatabase;
  const result = await database.query<T>(text, values);
  return result.rows;
}

function databaseBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function toViewerState(row: PublicEventSearchRow | undefined) {
  return {
    isUserInQueue: databaseBoolean(row?.viewerIsInQueue),
    lastEventJoined: row?.viewerLastEventJoined ?? 0,
  };
}

export const eventRepository: EventRepository = {
  async findPublicEvent(eventId, viewerId) {
    const rows = await query<PublicEventRow>(
      `
        SELECT
          e."Id" AS "id",
          e."Title" AS "title",
          e."Description" AS "description",
          e."AverageTime" AS "averageTime",
          e."EventStartTime"::text AS "eventStartTime",
          e."EventEndTime"::text AS "eventEndTime",
          e."Capacity" AS "capacity",
          e."StaffCount" AS "staffCount",
          e."UsersInQueue" AS "usersInQueue",
          e."IsActive" AS "isActive",
          e."AllowAnonymousJoining" AS "allowAnonymousJoining",
          e."AllowAutomaticSkips" AS "allowAutomaticSkips",
          e."EnableGeographicRestriction" AS "enableGeographicRestriction",
          e."Address" AS "address",
          e."Latitude" AS "latitude",
          e."Longitude" AS "longitude",
          e."RadiusInMeters" AS "radiusInMeters",
          COALESCE(
            NULLIF(organizer."UserName", ''),
            'SwiftLine organizer'
          ) AS "organizer",
          CASE
            WHEN NULLIF($2::text, '') IS NOT NULL
              AND e."CreatedBy" = $2::text
            THEN TRUE
            ELSE FALSE
          END AS "canManage"
        FROM public."Events" AS e
        LEFT JOIN public."AspNetUsers" AS organizer
          ON organizer."Id" = e."CreatedBy"
        WHERE e."Id" = $1::bigint
          AND e."IsDeleted" = FALSE
        LIMIT 1
      `,
      [eventId.toString(), viewerId],
    );

    return rows[0] ?? null;
  },

  async searchPublicEvents(search, viewerId): Promise<PublicEventSearchResult> {
    const pattern = search.query ? `%${escapeLikePattern(search.query)}%` : "";
    const offset = (search.page - 1) * search.size;

    const rows = await query<PublicEventSearchRow>(
      `
        SELECT
          e."Id" AS "id",
          e."Title" AS "title",
          e."Description" AS "description",
          e."AverageTime" AS "averageTime",
          e."EventStartTime"::text AS "eventStartTime",
          e."EventEndTime"::text AS "eventEndTime",
          e."UsersInQueue" AS "usersInQueue",
          e."StaffCount" AS "staffCount",
          e."IsActive" AS "isActive",
          e."AllowAnonymousJoining" AS "allowAnonymousJoining",
          e."EnableGeographicRestriction" AS "enableGeographicRestriction",
          e."RadiusInMeters" AS "radiusInMeters",
          e."Address" AS "address",
          COALESCE(
            NULLIF(organizer."UserName", ''),
            'SwiftLine organizer'
          ) AS "organizer",
          CASE
            WHEN NULLIF($2::text, '') IS NOT NULL
              AND e."CreatedBy" = $2::text
            THEN TRUE
            ELSE FALSE
          END AS "canManage",
          COUNT(*) OVER() AS "totalCount",
          COALESCE(viewer."IsInQueue", FALSE) AS "viewerIsInQueue",
          COALESCE(viewer."LastEventJoined", 0) AS "viewerLastEventJoined"
        FROM public."Events" AS e
        LEFT JOIN public."AspNetUsers" AS organizer
          ON organizer."Id" = e."CreatedBy"
        LEFT JOIN public."AspNetUsers" AS viewer
          ON viewer."Id" = NULLIF($2::text, '')
        WHERE e."IsDeleted" = FALSE
          AND e."Title" NOT IN ('General Clearance Test_Sept ''25', 'Testing for general clearance', 'Prueba', 'Clases 05-11 Sistemas de Salud')
          AND ($1::text = '' OR e."Title" ILIKE $1::text ESCAPE '\')
        ORDER BY e."CreatedAt" DESC NULLS LAST, e."Id" DESC
        LIMIT $3::integer
        OFFSET $4::integer
      `,
      [pattern, viewerId, search.size, offset],
    );

    let viewer = toViewerState(rows[0]);
    if (!rows.length && viewerId) {
      const viewerRows = await query<{
        isUserInQueue: unknown;
        lastEventJoined: unknown;
      }>(
        `
          SELECT
            "IsInQueue" AS "isUserInQueue",
            "LastEventJoined" AS "lastEventJoined"
          FROM public."AspNetUsers"
          WHERE "Id" = $1::text
          LIMIT 1
        `,
        [viewerId],
      );
      viewer = {
        isUserInQueue: databaseBoolean(viewerRows[0]?.isUserInQueue),
        lastEventJoined: viewerRows[0]?.lastEventJoined ?? 0,
      };
    }

    return {
      rows,
      totalCount: rows[0]?.totalCount ?? 0,
      viewer,
    };
  },
};

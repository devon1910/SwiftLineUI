import type {
  EventRepository,
  PublicEvent,
  PublicEventRow,
  PublicEventSearchItem,
  PublicEventSearchRow,
  SearchEventsData,
  SearchEventsQuery,
} from "./contracts";
import { toPublicEventJsonInteger } from "./json-integer";
import { isWithinEventHours } from "./validation";

function value(row: Record<string, unknown>, ...names: string[]): unknown {
  for (const name of names) {
    if (row[name] !== undefined) return row[name];
  }
  return undefined;
}

function integer(valueToConvert: unknown, fallback = 0): number {
  const converted = typeof valueToConvert === "bigint" ? Number(valueToConvert) : Number(valueToConvert);
  return Number.isSafeInteger(converted) ? converted : fallback;
}

function decimal(valueToConvert: unknown): number | null {
  if (valueToConvert === null || valueToConvert === undefined || valueToConvert === "") {
    return null;
  }
  const converted = Number(valueToConvert);
  return Number.isFinite(converted) ? converted : null;
}

function boolean(valueToConvert: unknown, fallback = false): boolean {
  if (typeof valueToConvert === "boolean") return valueToConvert;
  if (typeof valueToConvert === "number") return valueToConvert !== 0;
  if (typeof valueToConvert === "string") {
    if (valueToConvert.toLowerCase() === "true") return true;
    if (valueToConvert.toLowerCase() === "false") return false;
  }
  return fallback;
}

function text(valueToConvert: unknown, fallback = ""): string {
  return valueToConvert === null || valueToConvert === undefined
    ? fallback
    : String(valueToConvert);
}

function mapPublicEvent(row: PublicEventRow): PublicEvent {
  const record = row as unknown as Record<string, unknown>;
  return {
    id: toPublicEventJsonInteger(value(record, "id", "Id"), "id"),
    title: text(value(record, "title", "Title")),
    description: text(value(record, "description", "Description")),
    averageTime: integer(value(record, "averageTime", "AverageTime")),
    eventStartTime: text(value(record, "eventStartTime", "EventStartTime")),
    eventEndTime: text(value(record, "eventEndTime", "EventEndTime")),
    capacity: integer(value(record, "capacity", "Capacity")),
    staffCount: integer(value(record, "staffCount", "StaffCount")),
    usersInQueue: integer(value(record, "usersInQueue", "UsersInQueue")),
    isActive: boolean(value(record, "isActive", "IsActive"), true),
    allowAnonymousJoining: boolean(value(record, "allowAnonymousJoining", "AllowAnonymousJoining")),
    allowAutomaticSkips: boolean(value(record, "allowAutomaticSkips", "AllowAutomaticSkips"), true),
    enableGeographicRestriction: boolean(
      value(record, "enableGeographicRestriction", "EnableGeographicRestriction"),
    ),
    address: value(record, "address", "Address") == null ? null : text(value(record, "address", "Address")),
    latitude: decimal(value(record, "latitude", "Latitude")),
    longitude: decimal(value(record, "longitude", "Longitude")),
    radiusInMeters:
      value(record, "radiusInMeters", "RadiusInMeters") == null
        ? null
        : integer(value(record, "radiusInMeters", "RadiusInMeters")),
    organizer: text(value(record, "organizer", "Organizer"), "SwiftLine organizer"),
    canManage: boolean(value(record, "canManage", "CanManage")),
  };
}

function mapSearchEvent(row: PublicEventSearchRow, now: Date): PublicEventSearchItem {
  const record = row as unknown as Record<string, unknown>;
  const start = text(value(record, "eventStartTime", "EventStartTime"));
  const end = text(value(record, "eventEndTime", "EventEndTime"));

  return {
    id: toPublicEventJsonInteger(value(record, "id", "Id"), "id"),
    title: text(value(record, "title", "Title")),
    description: text(value(record, "description", "Description")),
    averageTime: integer(value(record, "averageTime", "AverageTime")),
    eventStartTime: start,
    eventEndTime: end,
    usersInQueue: integer(value(record, "usersInQueue", "UsersInQueue")),
    organizer: text(value(record, "organizer", "Organizer"), "SwiftLine organizer"),
    hasStarted: isWithinEventHours(start, end, now),
    staffCount: integer(value(record, "staffCount", "StaffCount")),
    isActive: boolean(value(record, "isActive", "IsActive"), true),
    allowAnonymousJoining: boolean(value(record, "allowAnonymousJoining", "AllowAnonymousJoining")),
    enableGeographicRestriction: boolean(
      value(record, "enableGeographicRestriction", "EnableGeographicRestriction"),
    ),
    radiusInMeters:
      value(record, "radiusInMeters", "RadiusInMeters") == null
        ? null
        : integer(value(record, "radiusInMeters", "RadiusInMeters")),
    address: value(record, "address", "Address") == null ? null : text(value(record, "address", "Address")),
    canManage: boolean(value(record, "canManage", "CanManage")),
  };
}

export function createEventsService(
  repository: EventRepository,
  now: () => Date = () => new Date(),
) {
  return {
    async getPublicEvent(eventId: bigint, viewerId: string | null): Promise<PublicEvent | null> {
      const row = await repository.findPublicEvent(eventId, viewerId);
      return row ? mapPublicEvent(row) : null;
    },

    async searchPublicEvents(
      search: SearchEventsQuery,
      viewerId: string | null,
    ): Promise<SearchEventsData> {
      const result = await repository.searchPublicEvents(search, viewerId);
      const firstRow = result.rows[0] as unknown as Record<string, unknown> | undefined;
      const totalCount = integer(result.totalCount ?? value(firstRow ?? {}, "totalCount", "TotalCount"));
      const viewer = result.viewer;
      const isUserInQueue = boolean(
        viewer?.isUserInQueue ?? result.isUserInQueue ?? value(firstRow ?? {}, "viewerIsInQueue"),
      );
      const lastEventJoined = toPublicEventJsonInteger(
        viewer?.lastEventJoined ?? result.lastEventJoined ?? value(firstRow ?? {}, "viewerLastEventJoined"),
        "lastEventJoined",
      );

      return {
        events: result.rows.map((row) => mapSearchEvent(row, now())),
        totalPages: Math.ceil(totalCount / search.size),
        isUserInQueue,
        lastEventJoined,
      };
    },
  };
}

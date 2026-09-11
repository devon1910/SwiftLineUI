/**
 * A public PostgreSQL `long`/`bigint` value.
 *
 * Both event implementations emit these values as JSON numbers. Values above
 * JavaScript's safe-integer boundary are rejected before serialization instead
 * of being silently converted to strings or rounded numbers.
 */
export type JsonInteger = number;

/** The public event shape used by the legacy GetEvent endpoint. */
export type PublicEvent = {
  id: JsonInteger;
  title: string;
  description: string;
  averageTime: number;
  eventStartTime: string;
  eventEndTime: string;
  capacity: number;
  staffCount: number;
  usersInQueue: number;
  isActive: boolean;
  allowAnonymousJoining: boolean;
  allowAutomaticSkips: boolean;
  enableGeographicRestriction: boolean;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusInMeters: number | null;
  organizer: string;
  canManage: boolean;
};

/** The public event shape used by the legacy SearchEvents endpoint. */
export type PublicEventSearchItem = {
  id: JsonInteger;
  title: string;
  description: string;
  averageTime: number;
  eventStartTime: string;
  eventEndTime: string;
  usersInQueue: number;
  organizer: string;
  hasStarted: boolean;
  staffCount: number;
  isActive: boolean;
  allowAnonymousJoining: boolean;
  enableGeographicRestriction: boolean;
  radiusInMeters: number | null;
  address: string | null;
  canManage: boolean;
};

export type SearchEventsData = {
  events: PublicEventSearchItem[];
  totalPages: number;
  isUserInQueue: boolean;
  lastEventJoined: JsonInteger;
};

export type ApiResult<T> = {
  data: T | null;
  message: string;
  status: boolean;
};

export type SearchEventsQuery = {
  page: number;
  size: number;
  query: string;
};

export type OptionalIdentity = {
  id: string;
};

export type PublicEventRow = {
  id: unknown;
  title: unknown;
  description: unknown;
  averageTime: unknown;
  eventStartTime: unknown;
  eventEndTime: unknown;
  capacity: unknown;
  staffCount: unknown;
  usersInQueue: unknown;
  isActive: unknown;
  allowAnonymousJoining: unknown;
  allowAutomaticSkips: unknown;
  enableGeographicRestriction: unknown;
  address: unknown;
  latitude: unknown;
  longitude: unknown;
  radiusInMeters: unknown;
  organizer: unknown;
  canManage: unknown;
};

export type PublicEventSearchRow = {
  id: unknown;
  title: unknown;
  description: unknown;
  averageTime: unknown;
  eventStartTime: unknown;
  eventEndTime: unknown;
  usersInQueue: unknown;
  organizer: unknown;
  staffCount: unknown;
  isActive: unknown;
  allowAnonymousJoining: unknown;
  enableGeographicRestriction: unknown;
  radiusInMeters: unknown;
  address: unknown;
  canManage: unknown;
  totalCount: unknown;
  viewerIsInQueue: unknown;
  viewerLastEventJoined: unknown;
};

export type ViewerQueueState = {
  isUserInQueue: boolean;
  lastEventJoined: unknown;
};

export type PublicEventSearchResult = {
  rows: PublicEventSearchRow[];
  totalCount?: unknown;
  viewer?: ViewerQueueState;
  // These aliases keep the service easy to mock and compatible with small repository adapters.
  isUserInQueue?: unknown;
  lastEventJoined?: unknown;
};

export interface EventRepository {
  findPublicEvent(eventId: bigint, viewerId: string | null): Promise<PublicEventRow | null>;
  searchPublicEvents(
    query: SearchEventsQuery,
    viewerId: string | null,
  ): Promise<PublicEventSearchResult>;
}

import { describe, expect, it, vi } from "vitest";
import type { EventRepository, PublicEventRow, PublicEventSearchRow } from "../../src/modules/events/contracts";
import { createEventsService } from "../../src/modules/events/service";

const publicRow = (overrides: Partial<PublicEventRow> = {}): PublicEventRow => ({
  id: 42,
  title: "Campus clinic",
  description: "Walk-in appointments",
  averageTime: 15,
  eventStartTime: "22:00:00",
  eventEndTime: "02:00:00",
  capacity: 100,
  staffCount: 2,
  usersInQueue: 8,
  isActive: true,
  allowAnonymousJoining: true,
  allowAutomaticSkips: true,
  enableGeographicRestriction: false,
  address: null,
  latitude: null,
  longitude: null,
  radiusInMeters: null,
  organizer: "organizer@example.test",
  canManage: true,
  ...overrides,
});

const searchRow = (overrides: Partial<PublicEventSearchRow> = {}): PublicEventSearchRow => ({
  id: 42,
  title: "Campus clinic",
  description: "Walk-in appointments",
  averageTime: 15,
  eventStartTime: "22:00:00",
  eventEndTime: "02:00:00",
  usersInQueue: 8,
  organizer: "organizer@example.test",
  staffCount: 2,
  isActive: true,
  allowAnonymousJoining: true,
  enableGeographicRestriction: false,
  radiusInMeters: null,
  address: null,
  canManage: true,
  totalCount: "21",
  viewerIsInQueue: true,
  viewerLastEventJoined: "42",
  ...overrides,
});

function repositoryMock(overrides: Partial<EventRepository> = {}): EventRepository {
  return {
    findPublicEvent: vi.fn(async () => publicRow()),
    searchPublicEvents: vi.fn(async () => ({ rows: [searchRow()] })),
    ...overrides,
  };
}

describe("events service", () => {
  it("maps a public detail without exposing CreatedBy or other persistence fields", async () => {
    const repository = repositoryMock({
      findPublicEvent: vi.fn(async (_eventId, viewerId) => {
        expect(viewerId).toBe("verified-user");
        return publicRow();
      }),
    });
    const service = createEventsService(repository);

    const event = await service.getPublicEvent(42n, "verified-user");

    expect(event).toMatchObject({
      id: 42,
      title: "Campus clinic",
      organizer: "organizer@example.test",
      canManage: true,
    });
    expect(event).not.toHaveProperty("createdBy");
    expect(event).not.toHaveProperty("isDeleted");
    expect(event).not.toHaveProperty("averageTimeToServeSeconds");
  });

  it("returns null for a repository miss so the route can emit a 404 envelope", async () => {
    const repository = repositoryMock({ findPublicEvent: vi.fn(async () => null) });
    const service = createEventsService(repository);

    await expect(service.getPublicEvent(404n, null)).resolves.toBeNull();
  });

  it("calculates total pages, preserves viewer queue state, and applies overnight semantics", async () => {
    const repository = repositoryMock({
      searchPublicEvents: vi.fn(async () => ({
        rows: [searchRow()],
        totalCount: "21",
        viewer: { isUserInQueue: true, lastEventJoined: "42" },
      })),
    });
    const service = createEventsService(
      repository,
      () => new Date("2026-09-10T22:30:00Z"),
    );

    const result = await service.searchPublicEvents({ page: 2, size: 10, query: "clinic" }, "verified-user");

    expect(result.totalPages).toBe(3);
    expect(result.isUserInQueue).toBe(true);
    expect(result.lastEventJoined).toBe(42);
    expect(Object.keys(result).sort()).toEqual([
      "events",
      "isUserInQueue",
      "lastEventJoined",
      "totalPages",
    ]);
    expect(result.events[0]).toMatchObject({ id: 42, canManage: true });
    expect(result.events[0].hasStarted).toBe(true);
    expect(Object.keys(result.events[0]).sort()).toEqual([
      "address",
      "allowAnonymousJoining",
      "averageTime",
      "canManage",
      "description",
      "enableGeographicRestriction",
      "eventEndTime",
      "eventStartTime",
      "hasStarted",
      "id",
      "isActive",
      "organizer",
      "radiusInMeters",
      "staffCount",
      "title",
      "usersInQueue",
    ]);
    expect(result.events[0]).toEqual({
      id: 42,
      title: "Campus clinic",
      description: "Walk-in appointments",
      averageTime: 15,
      eventStartTime: "22:00:00",
      eventEndTime: "02:00:00",
      usersInQueue: 8,
      organizer: "organizer@example.test",
      hasStarted: true,
      staffCount: 2,
      isActive: true,
      allowAnonymousJoining: true,
      enableGeographicRestriction: false,
      radiusInMeters: null,
      address: null,
      canManage: true,
    });
    expect(result.events[0]).not.toHaveProperty("createdBy");
    expect(result.events[0]).not.toHaveProperty("isDeleted");
    expect(result.events[0]).not.toHaveProperty("swiftLineUser");
    expect(repository.searchPublicEvents).toHaveBeenCalledWith(
      { page: 2, size: 10, query: "clinic" },
      "verified-user",
    );
  });

  it("defaults caller-specific queue state to anonymous values", async () => {
    const repository = repositoryMock({
      searchPublicEvents: vi.fn(async () => ({ rows: [], totalCount: 0 })),
    });
    const service = createEventsService(repository);

    await expect(service.searchPublicEvents({ page: 1, size: 20, query: "" }, null)).resolves.toEqual({
      events: [],
      totalPages: 0,
      isUserInQueue: false,
      lastEventJoined: 0,
    });
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EventRepository, PublicEventSearchRow } from "../../src/modules/events/contracts";
import { createEventsService } from "../../src/modules/events/service";
import { MAX_SAFE_JSON_INTEGER, PublicEventJsonIntegerError, toPublicEventJsonInteger } from "../../src/modules/events/json-integer";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/search-events.json", import.meta.url), "utf8"),
) as Record<string, unknown>;

const fixtureRow: PublicEventSearchRow = {
  id: MAX_SAFE_JSON_INTEGER.toString(),
  title: "Cross-runtime fixture",
  description: "One captured event",
  averageTime: 15,
  eventStartTime: "09:00:00",
  eventEndTime: "17:00:00",
  usersInQueue: 4,
  organizer: "fixture-owner@example.test",
  staffCount: 2,
  isActive: true,
  allowAnonymousJoining: true,
  enableGeographicRestriction: false,
  radiusInMeters: 250,
  address: "Queue Street",
  canManage: true,
  totalCount: "1",
  viewerIsInQueue: true,
  viewerLastEventJoined: (MAX_SAFE_JSON_INTEGER - 1n).toString(),
};

describe("public event JSON bigint policy", () => {
  it("serializes the Next contract against the captured .NET response fixture", async () => {
    const repository: EventRepository = {
      findPublicEvent: async () => null,
      searchPublicEvents: async () => ({ rows: [fixtureRow] }),
    };
    const service = createEventsService(repository, () => new Date("2026-09-10T12:00:00Z"));
    const data = await service.searchPublicEvents({ page: 1, size: 20, query: "" }, "fixture-owner");
    const actual = JSON.stringify({
      data,
      message: "Operation completed successfully",
      status: true,
    });

    expect(JSON.parse(actual)).toEqual(fixture);
    expect(JSON.stringify(JSON.parse(actual))).toBe(JSON.stringify(fixture));
    expect(typeof data.events[0].id).toBe("number");
    expect(typeof data.lastEventJoined).toBe("number");
  });

  it("rejects a bigint that cannot remain an exact JSON number", () => {
    expect(() => toPublicEventJsonInteger(MAX_SAFE_JSON_INTEGER + 1n, "id"))
      .toThrow(PublicEventJsonIntegerError);
    expect(() => toPublicEventJsonInteger("9007199254740992", "lastEventJoined"))
      .toThrow(/safe JSON integer range/);
  });
});

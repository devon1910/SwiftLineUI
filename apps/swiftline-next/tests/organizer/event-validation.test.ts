import { describe, expect, it } from "vitest";
import { validateOrganizerEvent } from "../../src/modules/organizer/events";

const validEvent = {
  title: "Community clinic",
  description: "A test queue",
  averageTime: 5,
  eventStartTime: "09:00",
  eventEndTime: "17:00",
  capacity: 50,
  staffCount: 1,
  allowAnonymousJoining: false,
  allowAutomaticSkips: true,
  enableGeographicRestriction: false,
  address: null,
  latitude: null,
  longitude: null,
};

describe("organizer event validation", () => {
  it("normalizes a legacy zero radius when geographic restriction is disabled", () => {
    const result = validateOrganizerEvent({ ...validEvent, radiusInMeters: 0 });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.radiusInMeters).toBeNull();
  });

  it("returns a useful capacity message", () => {
    const result = validateOrganizerEvent({ ...validEvent, capacity: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Queue capacity must be at least 1.");
    }
  });

  it("requires a positive radius when geographic restriction is enabled", () => {
    const result = validateOrganizerEvent({
      ...validEvent,
      enableGeographicRestriction: true,
      latitude: 6.5244,
      longitude: 3.3792,
      radiusInMeters: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Location and radius are required for geographic restrictions.",
      );
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  escapeLikePattern,
  isWithinEventHours,
  parsePositiveBigInt,
  parseSearchEventsQuery,
} from "../../src/modules/events/validation";

describe("event request validation", () => {
  it("accepts positive PostgreSQL bigint identifiers without converting them through Number", () => {
    const parsed = parsePositiveBigInt("9223372036854775807");

    expect(parsed).toEqual({ ok: true, value: 9223372036854775807n });
    expect(parsePositiveBigInt("0").ok).toBe(false);
    expect(parsePositiveBigInt("1.5").ok).toBe(false);
    expect(parsePositiveBigInt("9223372036854775808").ok).toBe(false);
  });

  it("uses bounded, deterministic pagination and trims bounded search input", () => {
    expect(parseSearchEventsQuery(new URL("https://swiftline.test/api/v1/Event/SearchEvents"))).toEqual({
      ok: true,
      value: { page: 1, size: 20, query: "" },
    });
    expect(
      parseSearchEventsQuery(
        new URL("https://swiftline.test/api/v1/Event/SearchEvents?Page=2&Size=25&Query=%20Clinic%20"),
      ),
    ).toEqual({ ok: true, value: { page: 2, size: 25, query: "Clinic" } });
    expect(parseSearchEventsQuery(new URL("https://swiftline.test/?Page=0")).ok).toBe(false);
    expect(parseSearchEventsQuery(new URL("https://swiftline.test/?Size=101")).ok).toBe(false);
    expect(parseSearchEventsQuery(new URL(`https://swiftline.test/?Query=${"a".repeat(101)}`)).ok).toBe(false);
  });

  it("escapes LIKE wildcards before they reach the SQL parameter", () => {
    expect(escapeLikePattern(String.raw`100%_\\clinic`)).toBe(String.raw`100\%\_\\\\clinic`);
  });
});

describe("event hours", () => {
  it("handles an event that crosses midnight", () => {
    expect(isWithinEventHours("22:00:00", "02:00:00", "23:30:00")).toBe(true);
    expect(isWithinEventHours("22:00:00", "02:00:00", "01:30:00")).toBe(true);
    expect(isWithinEventHours("22:00:00", "02:00:00", "12:00:00")).toBe(false);
  });

  it("keeps same-day boundaries inclusive", () => {
    expect(isWithinEventHours("09:00:00", "17:00:00", "09:00:00")).toBe(true);
    expect(isWithinEventHours("09:00:00", "17:00:00", "17:00:00")).toBe(true);
    expect(isWithinEventHours("09:00:00", "17:00:00", "17:00:01")).toBe(false);
  });
});

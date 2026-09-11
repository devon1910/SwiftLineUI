import type { SearchEventsQuery } from "./contracts";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE = 10_000;
export const MAX_PAGE_SIZE = 100;
export const MAX_QUERY_LENGTH = 100;
export const MAX_POSTGRES_BIGINT = 9_223_372_036_854_775_807n;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export function parsePositiveBigInt(value: unknown): ValidationResult<bigint> {
  if (typeof value === "bigint") {
    return value > 0n && value <= MAX_POSTGRES_BIGINT
      ? { ok: true, value }
      : { ok: false, message: "eventId must be a positive integer" };
  }

  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    return { ok: false, message: "eventId must be a positive integer" };
  }
  if (typeof value !== "string" && typeof value !== "number") {
    return { ok: false, message: "eventId must be a positive integer" };
  }

  const text = String(value).trim();
  if (!/^\d+$/.test(text)) {
    return { ok: false, message: "eventId must be a positive integer" };
  }

  try {
    const parsed = BigInt(text);
    return parsed > 0n && parsed <= MAX_POSTGRES_BIGINT
      ? { ok: true, value: parsed }
      : { ok: false, message: "eventId must be a positive integer" };
  } catch {
    return { ok: false, message: "eventId must be a positive integer" };
  }
}

function parseBoundedInteger(
  value: string | null,
  name: string,
  minimum: number,
  maximum: number,
  fallback: number,
): ValidationResult<number> {
  if (value === null || value.trim() === "") {
    return value === null
      ? { ok: true, value: fallback }
      : { ok: false, message: `${name} must be an integer` };
  }

  const text = value.trim();
  if (!/^\d+$/.test(text)) {
    return { ok: false, message: `${name} must be an integer` };
  }

  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    return {
      ok: false,
      message: `${name} must be between ${minimum} and ${maximum}`,
    };
  }

  return { ok: true, value: parsed };
}

function firstParam(url: URL, ...names: string[]): string | null {
  for (const name of names) {
    const value = url.searchParams.get(name);
    if (value !== null) return value;
  }
  return null;
}

export function parseSearchEventsQuery(url: URL): ValidationResult<SearchEventsQuery> {
  const page = parseBoundedInteger(
    firstParam(url, "Page", "page"),
    "Page",
    1,
    MAX_PAGE,
    DEFAULT_PAGE,
  );
  if (!page.ok) return page;

  const size = parseBoundedInteger(
    firstParam(url, "Size", "size"),
    "Size",
    1,
    MAX_PAGE_SIZE,
    DEFAULT_PAGE_SIZE,
  );
  if (!size.ok) return size;

  const rawQuery = firstParam(url, "Query", "query") ?? "";
  const query = rawQuery.trim();
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      ok: false,
      message: `Query must be ${MAX_QUERY_LENGTH} characters or fewer`,
    };
  }
  if (query.includes("\u0000")) {
    return { ok: false, message: "Query contains an invalid character" };
  }

  return { ok: true, value: { page: page.value, size: size.value, query } };
}

/** Escape SQL LIKE metacharacters while keeping the query parameterized. */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function clockSeconds(value: unknown): number | null {
  if (typeof value !== "string") return null;

  const match = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return hours * 3_600 + minutes * 60 + seconds;
}

function configuredTimeZone(): string {
  return process.env.SWIFTLINE_EVENT_TIME_ZONE?.trim() || "Africa/Lagos";
}

function currentClockSeconds(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: configuredTimeZone(),
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value ?? 0);
  return part("hour") * 3_600 + part("minute") * 60 + part("second");
}

/**
 * Event times are stored as PostgreSQL `time without time zone` values. The
 * inclusive comparison mirrors the .NET service, including queues crossing
 * midnight (for example, 22:00–02:00).
 */
export function isWithinEventHours(
  start: string,
  end: string,
  now: Date | string = new Date(),
): boolean {
  const startSeconds = clockSeconds(start);
  const endSeconds = clockSeconds(end);
  const nowSeconds =
    typeof now === "string" ? clockSeconds(now) : currentClockSeconds(now);

  if (startSeconds === null || endSeconds === null || nowSeconds === null) {
    return false;
  }

  if (startSeconds <= endSeconds) {
    return nowSeconds >= startSeconds && nowSeconds <= endSeconds;
  }

  return nowSeconds >= startSeconds || nowSeconds <= endSeconds;
}

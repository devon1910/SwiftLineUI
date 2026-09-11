import type { JsonInteger } from "./contracts";

/** The largest integer that can be represented exactly by a JSON consumer using JavaScript numbers. */
export const MAX_SAFE_JSON_INTEGER = 9_007_199_254_740_991n;
export const MIN_SAFE_JSON_INTEGER = -MAX_SAFE_JSON_INTEGER;

export class PublicEventJsonIntegerError extends RangeError {
  constructor(fieldName: string) {
    super(`${fieldName} exceeds the safe JSON integer range`);
    this.name = "PublicEventJsonIntegerError";
  }
}

function invalid(fieldName: string): never {
  throw new PublicEventJsonIntegerError(fieldName);
}

/**
 * Convert a database bigint/int8 value to the public event JSON policy.
 *
 * The pg driver normally returns bigint columns as strings. Conversion is
 * performed with BigInt first, so an out-of-range value is rejected without
 * passing through an unsafe JavaScript Number.
 */
export function toPublicEventJsonInteger(
  value: unknown,
  fieldName: string,
  fallback = 0,
): JsonInteger {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) invalid(fieldName);
    return value;
  }

  let parsed: bigint;
  if (typeof value === "bigint") {
    parsed = value;
  } else if (typeof value === "string" && /^[+-]?\d+$/.test(value.trim())) {
    try {
      parsed = BigInt(value.trim());
    } catch {
      return invalid(fieldName);
    }
  } else {
    return invalid(fieldName);
  }

  if (parsed < MIN_SAFE_JSON_INTEGER || parsed > MAX_SAFE_JSON_INTEGER) {
    return invalid(fieldName);
  }

  return Number(parsed);
}

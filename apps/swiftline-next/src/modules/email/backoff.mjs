export function calculateRetryDelayMs(
  attemptCount,
  {
    baseDelayMs = 30_000,
    maxDelayMs = 60 * 60 * 1000,
    jitterMs = 5_000,
    random = Math.random,
  } = {},
) {
  const attempt = Math.max(1, Math.trunc(Number(attemptCount) || 1));
  const safeBase = Math.max(0, Math.trunc(Number(baseDelayMs) || 0));
  const safeMax = Math.max(safeBase, Math.trunc(Number(maxDelayMs) || safeBase));
  const safeJitter = Math.max(0, Math.trunc(Number(jitterMs) || 0));
  const exponential = safeBase * 2 ** Math.min(attempt - 1, 30);
  const capped = Math.min(safeMax, exponential);
  const randomPart = safeJitter === 0
    ? 0
    : Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * safeJitter);

  return Math.min(safeMax, capped + randomPart);
}


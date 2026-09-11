import { hostname } from 'node:os';
import { DEFAULT_HEALTH_FILE } from './health.mjs';

const DEFAULTS = Object.freeze({
  advisoryLockKey: '73532428638150609',
  batchSize: 10,
  pollIntervalMs: 5_000,
  standbyIntervalMs: 5_000,
  errorBackoffMs: 10_000,
  leaseDurationMs: 30_000,
  heartbeatIntervalMs: 10_000,
  maxAttempts: 3,
  retryBaseDelayMs: 30_000,
  retryMaxDelayMs: 60 * 60 * 1000,
  retryJitterMs: 5_000,
  healthFile: DEFAULT_HEALTH_FILE,
  healthStaleAfterMs: 90_000,
});

function asNumber(value, fallback, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(parsed)));
}

function firstValue(sources, keys) {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null && source[key] !== '') return source[key];
    }
  }
  return undefined;
}

export function normalizeWorkerConfig(applicationConfig = {}, environment = process.env) {
  const sources = [
    applicationConfig?.emailWorker,
    applicationConfig?.worker?.email,
    applicationConfig?.worker,
    applicationConfig,
    environment,
  ];
  const value = (keys, fallback) => firstValue(sources, keys) ?? fallback;
  const leaseDurationMs = asNumber(
    value(['leaseDurationMs', 'EMAIL_WORKER_LEASE_MS', 'SWIFTLINE_EMAIL_LEASE_MS'], DEFAULTS.leaseDurationMs),
    DEFAULTS.leaseDurationMs,
    { minimum: 1, maximum: 24 * 60 * 60 * 1000 },
  );
  const heartbeatIntervalMs = asNumber(
    value(['heartbeatIntervalMs', 'EMAIL_WORKER_HEARTBEAT_MS', 'SWIFTLINE_EMAIL_HEARTBEAT_MS'], DEFAULTS.heartbeatIntervalMs),
    DEFAULTS.heartbeatIntervalMs,
    { minimum: 1, maximum: Math.max(1, leaseDurationMs - 1) },
  );

  return {
    advisoryLockKey: String(value(
      ['advisoryLockKey', 'EMAIL_WORKER_LOCK_KEY', 'SWIFTLINE_EMAIL_LOCK_KEY'],
      DEFAULTS.advisoryLockKey,
    )),
    workerId: String(value(
      ['workerId', 'EMAIL_WORKER_ID', 'SWIFTLINE_EMAIL_WORKER_ID'],
      `${hostname()}-${process.pid}`,
    )),
    batchSize: asNumber(value(['batchSize', 'EMAIL_WORKER_BATCH_SIZE'], DEFAULTS.batchSize), DEFAULTS.batchSize, { minimum: 1, maximum: 100 }),
    pollIntervalMs: asNumber(value(['pollIntervalMs', 'EMAIL_WORKER_POLL_MS'], DEFAULTS.pollIntervalMs), DEFAULTS.pollIntervalMs, { minimum: 50, maximum: 60 * 60 * 1000 }),
    standbyIntervalMs: asNumber(value(['standbyIntervalMs', 'EMAIL_WORKER_STANDBY_MS'], DEFAULTS.standbyIntervalMs), DEFAULTS.standbyIntervalMs, { minimum: 50, maximum: 60 * 60 * 1000 }),
    errorBackoffMs: asNumber(value(['errorBackoffMs', 'EMAIL_WORKER_ERROR_BACKOFF_MS'], DEFAULTS.errorBackoffMs), DEFAULTS.errorBackoffMs, { minimum: 50, maximum: 60 * 60 * 1000 }),
    leaseDurationMs,
    heartbeatIntervalMs,
    maxAttempts: asNumber(value(['maxAttempts', 'EMAIL_WORKER_MAX_ATTEMPTS'], DEFAULTS.maxAttempts), DEFAULTS.maxAttempts, { minimum: 1, maximum: 100 }),
    retryBaseDelayMs: asNumber(value(['retryBaseDelayMs', 'EMAIL_WORKER_RETRY_BASE_MS'], DEFAULTS.retryBaseDelayMs), DEFAULTS.retryBaseDelayMs, { minimum: 0, maximum: 60 * 60 * 1000 }),
    retryMaxDelayMs: asNumber(value(['retryMaxDelayMs', 'EMAIL_WORKER_RETRY_MAX_MS'], DEFAULTS.retryMaxDelayMs), DEFAULTS.retryMaxDelayMs, { minimum: 0, maximum: 7 * 24 * 60 * 60 * 1000 }),
    retryJitterMs: asNumber(value(['retryJitterMs', 'EMAIL_WORKER_RETRY_JITTER_MS'], DEFAULTS.retryJitterMs), DEFAULTS.retryJitterMs, { minimum: 0, maximum: 60 * 60 * 1000 }),
    healthFile: String(value(['healthFile', 'WORKER_HEALTH_FILE', 'SWIFTLINE_WORKER_HEALTH_FILE'], DEFAULTS.healthFile)),
    healthStaleAfterMs: asNumber(value(['healthStaleAfterMs', 'WORKER_HEALTH_STALE_MS'], DEFAULTS.healthStaleAfterMs), DEFAULTS.healthStaleAfterMs, { minimum: 1_000, maximum: 24 * 60 * 60 * 1000 }),
  };
}


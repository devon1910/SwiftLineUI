import {
  ACK_EMAIL_SQL,
  BEGIN_SQL,
  CLAIM_EMAILS_SQL,
  COMMIT_SQL,
  FAIL_EMAIL_SQL,
  HEARTBEAT_EMAIL_SQL,
  MARK_EXHAUSTED_SQL,
  RELEASE_OWNER_LEASES_SQL,
  ROLLBACK_SQL,
} from './sql.mjs';

function affectedRows(result) {
  if (typeof result?.rowCount === 'number') return result.rowCount;
  return Array.isArray(result?.rows) ? result.rows.length : 0;
}

function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(parsed)));
}

function boundedMilliseconds(value, fallback, maximum = 24 * 60 * 60 * 1000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(0, Math.trunc(parsed)));
}

function releaseClient(client, error) {
  if (typeof client?.release === 'function') client.release(error);
}

/**
 * PostgreSQL adapter for the existing EmailDeliveryRequests table.
 *
 * The only database assumption is the small pg-compatible interface below:
 * pool.connect() returns a client with query() and release(). This keeps the
 * worker usable with the shared @/lib/db pool without coupling it to an ORM.
 */
export class PostgresEmailQueue {
  constructor(pool) {
    if (!pool || typeof pool.connect !== 'function') {
      throw new TypeError('PostgresEmailQueue requires a pg-compatible pool');
    }

    this.pool = pool;
  }

  async claim({ limit, leaseOwner, leaseDurationMs, maxAttempts }) {
    const safeLimit = boundedInteger(limit, 10, 1, 100);
    const safeLeaseDurationMs = boundedMilliseconds(leaseDurationMs, 30_000);
    const safeMaxAttempts = boundedInteger(maxAttempts, 3, 1, 100);
    const client = await this.pool.connect();
    let released = false;

    const release = (error) => {
      if (released) return;
      released = true;
      releaseClient(client, error);
    };

    try {
      await client.query(BEGIN_SQL);
      await client.query(MARK_EXHAUSTED_SQL, [safeMaxAttempts]);
      const result = await client.query(CLAIM_EMAILS_SQL, [
        safeLimit,
        leaseOwner,
        safeLeaseDurationMs,
        safeMaxAttempts,
      ]);
      await client.query(COMMIT_SQL);
      return result.rows ?? [];
    } catch (error) {
      try {
        await client.query(ROLLBACK_SQL);
      } catch {
        // Preserve the original claim error. The pool client is discarded below.
      }
      release(error);
      throw error;
    } finally {
      release();
    }
  }

  async acknowledge({ id, leaseOwner }) {
    const result = await this.pool.query(ACK_EMAIL_SQL, [id, leaseOwner]);
    return affectedRows(result) === 1;
  }

  async fail({ id, leaseOwner, errorMessage, retryDelayMs, maxAttempts }) {
    const safeDelayMs = boundedMilliseconds(retryDelayMs, 0);
    const safeMaxAttempts = boundedInteger(maxAttempts, 3, 1, 100);
    const result = await this.pool.query(FAIL_EMAIL_SQL, [
      id,
      leaseOwner,
      String(errorMessage ?? 'email delivery failed'),
      safeMaxAttempts,
      safeDelayMs,
    ]);

    return {
      updated: affectedRows(result) === 1,
      deadLettered: Boolean(result.rows?.[0]?.deadLettered),
    };
  }

  async heartbeat({ id, leaseOwner, leaseDurationMs }) {
    const safeLeaseDurationMs = boundedMilliseconds(leaseDurationMs, 30_000);
    const result = await this.pool.query(HEARTBEAT_EMAIL_SQL, [
      id,
      leaseOwner,
      safeLeaseDurationMs,
    ]);
    return affectedRows(result) === 1;
  }

  async releaseOwnerLeases(leaseOwner) {
    const result = await this.pool.query(RELEASE_OWNER_LEASES_SQL, [leaseOwner]);
    return affectedRows(result);
  }
}

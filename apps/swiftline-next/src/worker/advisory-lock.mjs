export const TRY_ADVISORY_LOCK_SQL = `
SELECT pg_try_advisory_lock($1::bigint) AS acquired`;

export const RELEASE_ADVISORY_LOCK_SQL = `
SELECT pg_advisory_unlock($1::bigint) AS released`;

function releaseClient(client, error) {
  if (typeof client?.release === 'function') client.release(error);
}

/**
 * A session-level PostgreSQL advisory lock. The dedicated connection remains
 * checked out for the lifetime of the lock, which is what makes ownership
 * disappear automatically if the worker process or database session dies.
 */
export class PostgresAdvisoryLock {
  constructor(pool) {
    if (!pool || typeof pool.connect !== 'function') {
      throw new TypeError('PostgresAdvisoryLock requires a pg-compatible pool');
    }

    this.pool = pool;
  }

  async tryAcquire(lockKey, signal) {
    if (signal?.aborted) return null;

    const client = await this.pool.connect();
    let acquired = false;

    try {
      const result = await client.query(TRY_ADVISORY_LOCK_SQL, [String(lockKey)]);
      acquired = result.rows?.[0]?.acquired === true;

      if (!acquired || signal?.aborted) {
        releaseClient(client);
        return null;
      }

      let released = false;
      return {
        release: async () => {
          if (released) return;
          released = true;
          try {
            await client.query(RELEASE_ADVISORY_LOCK_SQL, [String(lockKey)]);
          } finally {
            releaseClient(client);
          }
        },
      };
    } catch (error) {
      releaseClient(client, error);
      throw error;
    }
  }
}


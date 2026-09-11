import { calculateRetryDelayMs } from '../modules/email/backoff.mjs';
import { createStructuredLogger } from './logger.mjs';
import { abortableSleep, isAbortError } from './sleep.mjs';

export const DEFAULT_EMAIL_WORKER_OPTIONS = Object.freeze({
  advisoryLockKey: '73532428638150609',
  workerId: 'swiftline-email-worker',
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
});

function mergeOptions(options) {
  const merged = { ...DEFAULT_EMAIL_WORKER_OPTIONS, ...options };
  if (merged.heartbeatIntervalMs >= merged.leaseDurationMs) {
    throw new RangeError('heartbeatIntervalMs must be less than leaseDurationMs');
  }
  return merged;
}

function asId(value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

/**
 * The mailer is intentionally injected. It runs after the claim transaction
 * commits, so provider I/O can never hold a PostgreSQL row lock open.
 */
export class EmailDeliveryWorker {
  constructor({
    queue,
    lock,
    mailer,
    health,
    logger = createStructuredLogger(),
    options = {},
    sleep = abortableSleep,
    random = Math.random,
  } = {}) {
    if (!queue) throw new TypeError('EmailDeliveryWorker requires a queue repository');
    if (!lock) throw new TypeError('EmailDeliveryWorker requires a leader lock');
    if (!mailer || typeof mailer.send !== 'function') {
      throw new TypeError('EmailDeliveryWorker requires an injected mailer.send()');
    }

    this.queue = queue;
    this.lock = lock;
    this.mailer = mailer;
    this.health = health;
    this.logger = logger;
    this.options = mergeOptions(options);
    this.sleep = sleep;
    this.random = random;
  }

  async run(signal) {
    const runSignal = signal ?? new AbortController().signal;
    this.health?.setState('starting', 'starting');
    this.logger.info('worker_started', { workerId: this.options.workerId });

    try {
      while (!runSignal.aborted) {
        let leaderLease = null;

        try {
          leaderLease = await this.lock.tryAcquire(this.options.advisoryLockKey, runSignal);
          if (!leaderLease) {
            this.health?.markStandby();
            this.logger.debug('leader_lock_unavailable', { workerId: this.options.workerId });
            if (!(await this.wait(this.options.standbyIntervalMs, runSignal))) break;
            continue;
          }

          this.health?.markLeader();
          this.logger.info('leader_lock_acquired', {
            workerId: this.options.workerId,
            lockKey: this.options.advisoryLockKey,
          });

          while (!runSignal.aborted) {
            let hadWork;
            try {
              hadWork = await this.runCycle(runSignal);
            } catch (error) {
              if (isAbortError(error, runSignal)) break;
              this.health?.markError(error);
              this.logger.error('worker_cycle_failed', { error });
              if (!(await this.wait(this.options.errorBackoffMs, runSignal))) break;
              continue;
            }

            if (!hadWork && !(await this.wait(this.options.pollIntervalMs, runSignal))) break;
          }
        } catch (error) {
          if (isAbortError(error, runSignal)) break;
          this.health?.markError(error);
          this.logger.error('worker_leader_loop_failed', { error });
          if (!(await this.wait(this.options.errorBackoffMs, runSignal))) break;
        } finally {
          if (leaderLease) {
            try {
              await leaderLease.release();
              this.logger.info('leader_lock_released', { workerId: this.options.workerId });
            } catch (error) {
              this.logger.error('leader_lock_release_failed', { error });
            }
          }
        }
      }
    } finally {
      try {
        await this.queue.releaseOwnerLeases?.(this.options.workerId);
      } catch (error) {
        this.logger.error('owner_lease_release_failed', { error });
      }
      this.health?.stop();
      await this.health?.flush?.();
      this.logger.info('worker_stopped', { workerId: this.options.workerId });
    }
  }

  async wait(milliseconds, signal) {
    try {
      await this.sleep(milliseconds, signal);
      return true;
    } catch (error) {
      if (isAbortError(error, signal)) return false;
      throw error;
    }
  }

  async runCycle(signal) {
    const claimed = await this.queue.claim({
      limit: this.options.batchSize,
      leaseOwner: this.options.workerId,
      leaseDurationMs: this.options.leaseDurationMs,
      maxAttempts: this.options.maxAttempts,
    });

    this.health?.markPoll(claimed.length);
    this.logger.debug('email_claim_completed', {
      workerId: this.options.workerId,
      claimedCount: claimed.length,
    });

    for (const email of claimed) {
      if (signal?.aborted) break;
      await this.processClaimedEmail(email, signal);
    }

    return claimed.length > 0;
  }

  async processClaimedEmail(email, signal) {
    const id = asId(email.id);
    const leaseOwner = email.leaseOwner ?? this.options.workerId;
    let heartbeat;
    this.health?.beginLease();

    try {
      heartbeat = this.startHeartbeat(email, signal);
      await this.mailer.send(email, signal);
      if (signal?.aborted) return { status: 'cancelled' };

      const acknowledged = await this.queue.acknowledge({ id, leaseOwner });
      if (!acknowledged) {
        this.logger.warn('email_ack_lease_lost', { emailId: id, leaseOwner });
        return { status: 'acknowledgement_lost' };
      }

      this.logger.info('email_delivered', { emailId: id, attempt: email.retryCount });
      return { status: 'delivered' };
    } catch (error) {
      if (isAbortError(error, signal)) {
        this.logger.info('email_delivery_cancelled', { emailId: id });
        return { status: 'cancelled' };
      }

      const retryDelayMs = calculateRetryDelayMs(email.retryCount, {
        baseDelayMs: this.options.retryBaseDelayMs,
        maxDelayMs: this.options.retryMaxDelayMs,
        jitterMs: this.options.retryJitterMs,
        random: this.random,
      });
      const failure = await this.queue.fail({
        id,
        leaseOwner,
        errorMessage: error?.message ?? String(error),
        retryDelayMs,
        maxAttempts: this.options.maxAttempts,
      });

      if (!failure.updated) {
        this.logger.warn('email_failure_lease_lost', { emailId: id, leaseOwner });
        return { status: 'failure_not_recorded' };
      }

      const event = failure.deadLettered ? 'email_dead_lettered' : 'email_retry_scheduled';
      this.logger[failure.deadLettered ? 'error' : 'warn'](event, {
        emailId: id,
        attempt: email.retryCount,
        retryDelayMs,
        error,
      });
      return { status: failure.deadLettered ? 'dead_lettered' : 'retry_scheduled' };
    } finally {
      if (heartbeat) await heartbeat.stop();
      this.health?.endLease();
    }
  }

  startHeartbeat(email, signal) {
    let active = true;
    let running = false;
    let current = Promise.resolve();
    const id = asId(email.id);
    const leaseOwner = email.leaseOwner ?? this.options.workerId;

    const tick = async () => {
      if (!active || running || signal?.aborted) return;
      running = true;
      current = Promise.resolve()
        .then(() => this.queue.heartbeat({
          id,
          leaseOwner,
          leaseDurationMs: this.options.leaseDurationMs,
        }))
        .then((extended) => {
          if (!extended) this.logger.warn('email_heartbeat_lease_lost', { emailId: id, leaseOwner });
        })
        .catch((error) => {
          if (!isAbortError(error, signal)) this.logger.warn('email_heartbeat_failed', { emailId: id, error });
        })
        .finally(() => {
          running = false;
        });
      await current;
    };

    const timer = setInterval(() => { void tick(); }, this.options.heartbeatIntervalMs);
    timer.unref?.();

    return {
      stop: async () => {
        active = false;
        clearInterval(timer);
        await current;
      },
    };
  }
}


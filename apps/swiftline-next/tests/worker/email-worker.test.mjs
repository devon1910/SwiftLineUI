import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateRetryDelayMs } from '../../src/modules/email/backoff.mjs';
import { EmailDeliveryWorker } from '../../src/worker/email-worker.mjs';

function createLogger() {
  const records = [];
  const logger = Object.fromEntries(['debug', 'info', 'warn', 'error'].map((level) => [
    level,
    (event, fields) => records.push({ level, event, fields }),
  ]));
  return { logger, records };
}

function createQueue({ claimed = [] } = {}) {
  const calls = [];
  let claimCount = 0;
  return {
    calls,
    async claim(input) {
      calls.push(['claim', input]);
      claimCount += 1;
      return claimCount === 1 ? claimed : [];
    },
    async acknowledge(input) {
      calls.push(['acknowledge', input]);
      return true;
    },
    async fail(input) {
      calls.push(['fail', input]);
      return { updated: true, deadLettered: false };
    },
    async heartbeat(input) {
      calls.push(['heartbeat', input]);
      return true;
    },
    async releaseOwnerLeases(input) {
      calls.push(['releaseOwnerLeases', input]);
    },
  };
}

function baseOptions(overrides = {}) {
  return {
    workerId: 'test-worker',
    advisoryLockKey: '99',
    heartbeatIntervalMs: 5,
    leaseDurationMs: 50,
    pollIntervalMs: 1,
    standbyIntervalMs: 1,
    errorBackoffMs: 1,
    retryBaseDelayMs: 100,
    retryMaxDelayMs: 500,
    retryJitterMs: 0,
    ...overrides,
  };
}

test('successful delivery acknowledges only after the injected mailer resolves', async () => {
  const order = [];
  const queue = createQueue({
    claimed: [{ id: 42, recipientEmail: 'a@example.test', retryCount: 1, leaseOwner: 'test-worker' }],
  });
  const originalAcknowledge = queue.acknowledge;
  queue.acknowledge = async (input) => {
    order.push('ack');
    return originalAcknowledge(input);
  };
  const mailer = {
    async send(email) {
      order.push(`send:${email.id}`);
    },
  };
  const { logger, records } = createLogger();
  const worker = new EmailDeliveryWorker({ queue, lock: {}, mailer, logger, options: baseOptions() });

  worker.lock = { tryAcquire: async () => null };
  await worker.processClaimedEmail(
    { id: 42, recipientEmail: 'a@example.test', retryCount: 1, leaseOwner: 'test-worker' },
    new AbortController().signal,
  );

  assert.deepEqual(order, ['send:42', 'ack']);
  assert.deepEqual(queue.calls.find(([name]) => name === 'acknowledge'), [
    'acknowledge',
    { id: 42, leaseOwner: 'test-worker' },
  ]);
  assert.equal(records.some((record) => record.event === 'email_delivered'), true);
});

test('mailer failure records a bounded retry and never acknowledges', async () => {
  const queue = createQueue({
    claimed: [{ id: 7, recipientEmail: 'b@example.test', retryCount: 2, leaseOwner: 'test-worker' }],
  });
  const mailer = { send: async () => { throw new Error('provider unavailable'); } };
  const { logger, records } = createLogger();
  const worker = new EmailDeliveryWorker({ queue, lock: {}, mailer, logger, options: baseOptions() });

  await worker.processClaimedEmail(
    { id: 7, recipientEmail: 'b@example.test', retryCount: 2, leaseOwner: 'test-worker' },
    new AbortController().signal,
  );

  assert.equal(queue.calls.some(([name]) => name === 'acknowledge'), false);
  const failure = queue.calls.find(([name]) => name === 'fail');
  assert.deepEqual(failure, [
    'fail',
    {
      id: 7,
      leaseOwner: 'test-worker',
      errorMessage: 'provider unavailable',
      retryDelayMs: 200,
      maxAttempts: 3,
    },
  ]);
  assert.equal(records.some((record) => record.event === 'email_retry_scheduled'), true);
});

test('leader loop is cancellable and releases owned leases during graceful shutdown', async () => {
  const controller = new AbortController();
  const queue = createQueue();
  const lockCalls = [];
  const lock = {
    async tryAcquire(key) {
      lockCalls.push(key);
      return {
        async release() {
          lockCalls.push('released');
        },
      };
    },
  };
  const mailer = { send: async () => {} };
  const { logger } = createLogger();
  const worker = new EmailDeliveryWorker({
    queue,
    lock,
    mailer,
    logger,
    options: baseOptions(),
    sleep: async () => controller.abort(),
  });

  await worker.run(controller.signal);

  assert.deepEqual(lockCalls, ['99', 'released']);
  assert.deepEqual(queue.calls.at(-1), ['releaseOwnerLeases', 'test-worker']);
});

test('backoff remains bounded and adds deterministic jitter', () => {
  assert.equal(calculateRetryDelayMs(1, {
    baseDelayMs: 100,
    maxDelayMs: 250,
    jitterMs: 20,
    random: () => 0.5,
  }), 110);
  assert.equal(calculateRetryDelayMs(8, {
    baseDelayMs: 100,
    maxDelayMs: 250,
    jitterMs: 20,
    random: () => 0.99,
  }), 250);
});


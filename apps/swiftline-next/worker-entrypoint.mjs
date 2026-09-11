import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const healthFile = process.env.WORKER_HEALTH_FILE
  ?? process.env.SWIFTLINE_WORKER_HEALTH_FILE
  ?? '/tmp/swiftline-email-worker-health.json';

function moduleUrl(specifier) {
  if (specifier.startsWith('.') || isAbsolute(specifier)) {
    return pathToFileURL(isAbsolute(specifier) ? specifier : resolve(process.cwd(), specifier)).href;
  }
  return specifier;
}

async function healthcheck() {
  try {
    const snapshot = JSON.parse(await readFile(healthFile, 'utf8'));
    const maxAgeMs = Number(process.env.WORKER_HEALTH_MAX_AGE_MS ?? 90_000);
    const ageMs = Date.now() - new Date(snapshot.updatedAt).getTime();
    const activeState = snapshot.state === 'running' || snapshot.state === 'standby';
    const healthy = Boolean(snapshot.healthy) && activeState && ageMs >= 0 && ageMs <= maxAgeMs;
    if (!healthy) process.exitCode = 1;
    process.stdout.write(`${JSON.stringify({ ...snapshot, healthy, ageMs })}\n`);
  } catch (error) {
    process.exitCode = 1;
    process.stderr.write(`${JSON.stringify({ healthy: false, state: 'missing', error: error.message })}\n`);
  }
}

async function loadMailer() {
  const specifier = process.env.SWIFTLINE_EMAIL_MAILER_MODULE;
  const imported = await import(moduleUrl(specifier?.trim() || './dist/smtp-mailer.mjs'));
  const factory = imported.createMailer ?? imported.default?.createMailer;
  const mailer = typeof factory === 'function'
    ? await factory({ environment: process.env })
    : imported.mailer ?? imported.default;

  if (!mailer || typeof mailer.send !== 'function') {
    throw new TypeError('The injected email mailer must expose send(email, signal)');
  }

  return mailer;
}

async function run() {
  if (process.argv.includes('--healthcheck')) {
    await healthcheck();
    return;
  }

  const runtimeModule = process.env.SWIFTLINE_WORKER_MODULE ?? './dist/worker.mjs';
  const runtime = await import(moduleUrl(runtimeModule));
  const mailer = await loadMailer();
  const shutdown = new AbortController();
  let signalCount = 0;

  const requestShutdown = (signal) => {
    signalCount += 1;
    process.stderr.write(`${JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'swiftline-email-worker',
      event: 'shutdown_requested',
      signal,
      signalCount,
    })}\n`);
    shutdown.abort();
  };

  process.once('SIGTERM', () => requestShutdown('SIGTERM'));
  process.once('SIGINT', () => requestShutdown('SIGINT'));
  await runtime.startEmailWorker({ mailer, signal: shutdown.signal });
}

run().catch((error) => {
  process.exitCode = 1;
  process.stderr.write(`${JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'fatal',
    service: 'swiftline-email-worker',
    event: 'worker_fatal',
    error: { name: error.name, message: error.message, stack: error.stack },
  })}\n`);
});

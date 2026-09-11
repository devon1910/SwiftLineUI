import { getDbPool } from '@/lib/db';
import { getDatabaseEnv } from '@/lib/config';
import { PostgresEmailQueue } from '../modules/email/repository.mjs';
import { PostgresAdvisoryLock } from './advisory-lock.mjs';
import { normalizeWorkerConfig } from './config.mjs';
import { WorkerHealth } from './health.mjs';
import { createStructuredLogger } from './logger.mjs';
import { EmailDeliveryWorker } from './email-worker.mjs';

/** Build the production worker from the shared Next foundation modules. */
export function createEmailWorker({ mailer, pool, applicationConfig } = {}) {
  const resolvedPool = pool ?? getDbPool();
  const resolvedConfig = applicationConfig ?? getDatabaseEnv();
  const options = normalizeWorkerConfig(resolvedConfig);
  const logger = createStructuredLogger({ service: 'swiftline-email-worker' });
  const health = new WorkerHealth({
    workerId: options.workerId,
    filePath: options.healthFile,
    staleAfterMs: options.healthStaleAfterMs,
    logger,
  });

  return new EmailDeliveryWorker({
    queue: new PostgresEmailQueue(resolvedPool),
    lock: new PostgresAdvisoryLock(resolvedPool),
    mailer,
    health,
    logger,
    options,
  });
}

export async function startEmailWorker({ mailer, signal, pool, applicationConfig } = {}) {
  const worker = createEmailWorker({ mailer, pool, applicationConfig });
  await worker.run(signal);
}

import { getDbPool } from "@/lib/db";
import { getEnv } from "@/lib/config";
// @ts-expect-error Existing worker modules are JavaScript and bundled separately.
import { PostgresEmailQueue } from "./repository.mjs";
// @ts-expect-error Existing worker modules are JavaScript and bundled separately.
import { PostgresAdvisoryLock } from "@/worker/advisory-lock.mjs";
// @ts-expect-error Existing worker modules are JavaScript and bundled separately.
import { EmailDeliveryWorker } from "@/worker/email-worker.mjs";
// @ts-expect-error Existing worker modules are JavaScript and bundled separately.
import { createMailer } from "@/worker/smtp-mailer.mjs";

export async function processPendingEmails() {
  const pool = getDbPool(); const lock = new PostgresAdvisoryLock(pool); const lease = await lock.tryAcquire("73532428638150609");
  if (!lease) return { processed: 0, activeRun: true };
  try {
    let processed = 0;
    const worker = new EmailDeliveryWorker({ queue: new PostgresEmailQueue(pool), lock, mailer: createMailer(), options: { workerId: `vercel-${crypto.randomUUID()}`, batchSize: 10 } });
    const original = worker.processClaimedEmail.bind(worker);
    worker.processClaimedEmail = async (...args: unknown[]) => { processed += 1; return original(...args); };
    await worker.runCycle(new AbortController().signal);
    return { processed, activeRun: false };
  } finally { await lease.release(); }
}

export async function processEmailBatch(request: Request) {
  const secret = getEnv().CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await processPendingEmails();
  return Response.json({
    status: true,
    data: { processed: result.processed },
    message: result.activeRun
      ? "Another delivery run is active."
      : "Email batch processed.",
  });
}

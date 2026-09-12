import { processEmailBatch } from "@/modules/email/cron";
export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = (request: Request) => processEmailBatch(request);

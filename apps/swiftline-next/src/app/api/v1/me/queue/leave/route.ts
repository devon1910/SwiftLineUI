import { leaveQueue } from "@/modules/queue/routes";
export const runtime = "nodejs";
export const POST = (request: Request) => leaveQueue(request);

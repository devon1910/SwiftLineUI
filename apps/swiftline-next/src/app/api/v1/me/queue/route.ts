import { getMyQueue } from "@/modules/queue/routes";
export const runtime = "nodejs";
export const GET = (request: Request) => getMyQueue(request);

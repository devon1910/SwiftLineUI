import { joinQueue } from "@/modules/queue/routes";
export const runtime = "nodejs";
export async function POST(request: Request, context: RouteContext<"/api/v1/events/[eventId]/join">) { const { eventId } = await context.params; return joinQueue(request, eventId); }

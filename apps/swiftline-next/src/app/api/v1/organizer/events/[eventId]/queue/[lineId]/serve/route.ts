import { serveQueueMember } from "@/modules/queue/routes";
export const runtime = "nodejs";
export async function POST(request: Request,context: RouteContext<"/api/v1/organizer/events/[eventId]/queue/[lineId]/serve">){const {eventId,lineId}=await context.params;return serveQueueMember(request,eventId,lineId);}

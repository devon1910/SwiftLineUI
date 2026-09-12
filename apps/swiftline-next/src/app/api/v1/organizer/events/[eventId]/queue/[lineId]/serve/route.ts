import { serveQueueMember } from "@/modules/queue/routes";
export const runtime = "nodejs";
export async function POST(request: Request,context: { params: Promise<{ eventId: string; lineId: string }> }){const {eventId,lineId}=await context.params;return serveQueueMember(request,eventId,lineId);}

import { getOrganizerQueue, setQueueActivity } from "@/modules/queue/routes";
export const runtime = "nodejs";
export async function GET(request: Request,context: { params: Promise<{ eventId: string }> }){const {eventId}=await context.params;return getOrganizerQueue(request,eventId);}
export async function PATCH(request: Request,context: { params: Promise<{ eventId: string }> }){const {eventId}=await context.params;return setQueueActivity(request,eventId);}

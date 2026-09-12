import { joinQueue } from "@/modules/queue/routes";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ eventId: string }> }) { const { eventId } = await context.params; return joinQueue(request, eventId); }

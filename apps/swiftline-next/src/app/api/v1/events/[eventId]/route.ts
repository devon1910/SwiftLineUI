import { handleGetEvent } from "@/modules/events/routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = { params: Promise<{ eventId: string }> | { eventId: string } };

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  return handleGetEvent(request, params.eventId);
}

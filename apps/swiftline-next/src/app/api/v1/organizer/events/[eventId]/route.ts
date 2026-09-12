import { deleteOrganizerEvent, updateOrganizerEvent } from "@/modules/organizer/events";
export const runtime = "nodejs";
export async function PUT(request: Request, context: RouteContext<"/api/v1/organizer/events/[eventId]">) { const { eventId } = await context.params; return updateOrganizerEvent(request, eventId); }
export async function DELETE(request: Request, context: RouteContext<"/api/v1/organizer/events/[eventId]">) { const { eventId } = await context.params; return deleteOrganizerEvent(request, eventId); }

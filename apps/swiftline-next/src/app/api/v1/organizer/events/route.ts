import { createOrganizerEvent, listOrganizerEvents } from "@/modules/organizer/events";
export const runtime = "nodejs";
export const GET = (request: Request) => listOrganizerEvents(request);
export const POST = (request: Request) => createOrganizerEvent(request);

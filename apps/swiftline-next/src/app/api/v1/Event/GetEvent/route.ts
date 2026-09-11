import { handleGetEvent } from "@/modules/events/routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  return handleGetEvent(request);
}

import { getReadinessResponse } from "../response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return getReadinessResponse();
}

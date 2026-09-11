import { getLivenessResponse, getReadinessResponse } from "./response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function isReadinessRequest(request: Request): boolean {
  const value = new URL(request.url).searchParams.get("ready");
  return value === "1" || value?.toLowerCase() === "true";
}

export async function GET(request: Request) {
  return isReadinessRequest(request) ? getReadinessResponse() : getLivenessResponse();
}

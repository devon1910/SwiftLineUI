import { handleLogout } from "@/modules/auth/routes";
export const runtime = "nodejs";
export const POST = (request: Request) => handleLogout(request);

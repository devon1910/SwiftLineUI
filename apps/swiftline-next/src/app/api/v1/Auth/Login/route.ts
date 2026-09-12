import { handleLogin } from "@/modules/auth/routes";
export const runtime = "nodejs";
export const POST = (request: Request) => handleLogin(request);

import { beginGoogleLogin } from "@/modules/auth/google";
export const runtime = "nodejs";
export const GET = (request: Request) => beginGoogleLogin(request);

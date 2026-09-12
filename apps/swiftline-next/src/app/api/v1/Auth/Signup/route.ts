import { handleSignup } from "@/modules/auth/routes";
export const runtime = "nodejs";
export const POST = (request: Request) => handleSignup(request);

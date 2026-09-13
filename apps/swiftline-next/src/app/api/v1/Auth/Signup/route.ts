import { handleSignup } from "@/modules/auth/routes";
export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = (request: Request) => handleSignup(request);

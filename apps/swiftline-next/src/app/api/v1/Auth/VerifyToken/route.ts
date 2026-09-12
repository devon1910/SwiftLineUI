import { handleVerifyEmail } from "@/modules/auth/routes";

export const runtime = "nodejs";
export const POST = (request: Request) => handleVerifyEmail(request);

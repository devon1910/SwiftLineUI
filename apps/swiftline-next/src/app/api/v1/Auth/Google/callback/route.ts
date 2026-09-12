import { finishGoogleLogin } from "@/modules/auth/google";
export const runtime = "nodejs";
export const GET = (request: Request) => finishGoogleLogin(request);

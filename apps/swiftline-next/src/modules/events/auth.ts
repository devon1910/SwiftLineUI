import { getOptionalAuth } from "@/lib/auth";
import type { OptionalIdentity } from "./contracts";

export async function getOptionalVerifiedIdentity(request: Request): Promise<OptionalIdentity | null> {
  try {
    const identity = await getOptionalAuth(request);
    return identity?.subject ? { id: identity.subject } : null;
  } catch {
    // Optional authentication is fail-closed: a malformed or expired token
    // is treated as an anonymous request for public reads.
    return null;
  }
}

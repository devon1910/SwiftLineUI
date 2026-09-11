import { createHash, randomBytes, randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import type { JwtConfig } from "@/lib/auth";

const nameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const nameIdClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export type TokenUser = { id: string; username: string; roles: string[] };

export async function issueAccessToken(user: TokenUser, config: JwtConfig, ttlSeconds = 900): Promise<string> {
  return new SignJWT({
    [nameClaim]: user.username,
    [nameIdClaim]: user.id,
    [roleClaim]: user.roles.length === 1 ? user.roles[0] : user.roles,
    unique_name: user.username,
    jti: randomUUID(),
  }).setProtectedHeader({ alg: config.JWT_ALGORITHM, typ: "JWT" })
    .setIssuer(config.JWT_ISSUER).setAudience(config.JWT_AUDIENCE).setSubject(user.id)
    .setIssuedAt().setExpirationTime(`${ttlSeconds}s`)
    .sign(new TextEncoder().encode(config.JWT_SECRET));
}

export const generateRefreshToken = (): string => randomBytes(32).toString("base64url");
export const hashRefreshToken = (token: string): string => createHash("sha256").update(token, "utf8").digest("hex");

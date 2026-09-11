import { jwtVerify, type JWTPayload } from "jose";

import { getEnv, type AppEnv } from "@/lib/config";

const nameIdentifierClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export type JwtConfig = Pick<AppEnv, "JWT_ISSUER" | "JWT_AUDIENCE" | "JWT_ALGORITHM" | "JWT_SECRET">;

export type AuthIdentity = {
  subject: string;
  claims: JWTPayload;
};

function readSubject(claims: JWTPayload): string | null {
  const subjectCandidates = [
    claims.sub,
    claims.nameid,
    claims[nameIdentifierClaim],
  ];

  const subject = subjectCandidates.find((candidate): candidate is string => (
    typeof candidate === "string" && candidate.trim().length > 0
  ));

  return subject?.trim() ?? null;
}

export function readBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = /^Bearer\s+(\S+)$/i.exec(authorization.trim());
  return match?.[1] ?? null;
}

export async function verifyAccessToken(
  token: string,
  config: JwtConfig = getEnv(),
  currentDate = new Date(),
): Promise<AuthIdentity | null> {
  if (!token || token.length > 16_384) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.JWT_SECRET), {
      algorithms: [config.JWT_ALGORITHM],
      audience: config.JWT_AUDIENCE,
      currentDate,
      issuer: config.JWT_ISSUER,
    });

    // jose checks exp when present. SwiftLine access tokens always include it,
    // so require it here instead of accepting a non-expiring bearer token.
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(currentDate.getTime() / 1000)) {
      return null;
    }

    const subject = readSubject(payload);

    if (!subject) {
      return null;
    }

    return { claims: payload, subject };
  } catch {
    // Public routes treat invalid credentials as anonymous. Protected routes
    // can turn a null identity into a consistent 401 response later.
    return null;
  }
}

export async function getOptionalAuth(
  request: Request,
  config: JwtConfig = getEnv(),
  currentDate = new Date(),
): Promise<AuthIdentity | null> {
  const token = readBearerToken(request);

  if (!token) {
    return null;
  }

  return verifyAccessToken(token, config, currentDate);
}

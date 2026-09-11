CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public."AuthSessions" (
  "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserId" text NOT NULL REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE,
  "FamilyId" uuid NOT NULL DEFAULT gen_random_uuid(),
  "RefreshTokenHash" char(64) NOT NULL UNIQUE,
  "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "ExpiresAt" timestamp with time zone NOT NULL,
  "RotatedAt" timestamp with time zone,
  "RevokedAt" timestamp with time zone,
  "ReplacedBySessionId" uuid REFERENCES public."AuthSessions"("Id") ON DELETE SET NULL,
  "RevocationReason" text,
  "UserAgent" text,
  "IpAddress" inet,
  CONSTRAINT "CK_AuthSessions_Expiry" CHECK ("ExpiresAt" > "CreatedAt")
);

CREATE INDEX IF NOT EXISTS "IX_AuthSessions_UserId_Active"
  ON public."AuthSessions" ("UserId", "ExpiresAt")
  WHERE "RevokedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "IX_AuthSessions_FamilyId"
  ON public."AuthSessions" ("FamilyId");

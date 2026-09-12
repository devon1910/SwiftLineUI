BEGIN;

CREATE TABLE IF NOT EXISTS public."EmailVerificationTokens" (
  "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserId" text NOT NULL REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE,
  "TokenHash" char(64) NOT NULL UNIQUE,
  "ExpiresAt" timestamp with time zone NOT NULL,
  "ConsumedAt" timestamp with time zone NULL,
  "CreatedAt" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "IX_EmailVerificationTokens_User_Active" ON public."EmailVerificationTokens" ("UserId", "ExpiresAt") WHERE "ConsumedAt" IS NULL;

CREATE TABLE IF NOT EXISTS public."OAuthLoginCodes" (
  "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserId" text NOT NULL REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE,
  "CodeHash" char(64) NOT NULL UNIQUE,
  "ExpiresAt" timestamp with time zone NOT NULL,
  "ConsumedAt" timestamp with time zone NULL,
  "CreatedAt" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "IX_OAuthLoginCodes_Active" ON public."OAuthLoginCodes" ("CodeHash", "ExpiresAt") WHERE "ConsumedAt" IS NULL;

COMMIT;

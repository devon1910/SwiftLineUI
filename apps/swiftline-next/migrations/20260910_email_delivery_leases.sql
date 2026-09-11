-- Additive lease fields for the existing public."EmailDeliveryRequests" table.
-- Run this migration before starting the Node worker. It does not rename or
-- replace the legacy table and it does not claim exactly-once delivery.

BEGIN;

ALTER TABLE public."EmailDeliveryRequests"
  ADD COLUMN IF NOT EXISTS "LeaseOwner" text NULL,
  ADD COLUMN IF NOT EXISTS "LeaseUntil" timestamp with time zone NULL,
  ADD COLUMN IF NOT EXISTS "LastAttemptAt" timestamp with time zone NULL,
  ADD COLUMN IF NOT EXISTS "NextAttemptAt" timestamp with time zone NULL,
  ADD COLUMN IF NOT EXISTS "LastError" text NULL,
  ADD COLUMN IF NOT EXISTS "DeadLetteredAt" timestamp with time zone NULL;

-- Existing rows were eligible under the legacy RetryCount-only worker. Make
-- them immediately eligible according to their existing creation timestamp.
UPDATE public."EmailDeliveryRequests"
SET "NextAttemptAt" = COALESCE("NextAttemptAt", "DateCreated", now())
WHERE "NextAttemptAt" IS NULL;

ALTER TABLE public."EmailDeliveryRequests"
  ALTER COLUMN "NextAttemptAt" SET DEFAULT now(),
  ALTER COLUMN "NextAttemptAt" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "IX_EmailDeliveryRequests_LeaseClaim"
  ON public."EmailDeliveryRequests" ("NextAttemptAt", "LeaseUntil", "Id")
  WHERE "IsSent" = false AND "DeadLetteredAt" IS NULL;

COMMIT;


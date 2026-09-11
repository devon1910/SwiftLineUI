/**
 * SQL for the first Node worker slice.
 *
 * The names below intentionally match the existing EF/PostgreSQL schema. Keep
 * this module free of ORM calls so the claim contract can be reviewed and
 * tested independently of the Next.js foundation layer.
 */

export const EMAIL_REQUESTS_TABLE = 'public."EmailDeliveryRequests"';

export const BEGIN_SQL = 'BEGIN';
export const COMMIT_SQL = 'COMMIT';
export const ROLLBACK_SQL = 'ROLLBACK';

/**
 * A row whose final attempt was interrupted after its lease expired cannot be
 * observed by the mailer. Mark it dead-lettered before taking new work. This
 * is deliberately in the same transaction as the claim statement.
 */
export const MARK_EXHAUSTED_SQL = `
UPDATE ${EMAIL_REQUESTS_TABLE}
SET
  "DeadLetteredAt" = COALESCE("DeadLetteredAt", now()),
  "LeaseOwner" = NULL,
  "LeaseUntil" = NULL,
  "LastError" = COALESCE("LastError", 'delivery attempts exhausted'),
  "NextAttemptAt" = now()
WHERE "IsSent" = false
  AND "DeadLetteredAt" IS NULL
  AND "RetryCount" >= $1
  AND ("LeaseUntil" IS NULL OR "LeaseUntil" <= now())`;

/**
 * Claim and mutate rows in one transaction. The CTE locks eligible rows with
 * SKIP LOCKED, then the UPDATE stamps the lease and consumes one attempt.
 * Mail is never sent while this transaction is open.
 */
export const CLAIM_EMAILS_SQL = `
WITH candidates AS (
  SELECT "Id"
  FROM ${EMAIL_REQUESTS_TABLE}
  WHERE "IsSent" = false
    AND "DeadLetteredAt" IS NULL
    AND "RetryCount" < $4
    AND "NextAttemptAt" <= now()
    AND ("LeaseUntil" IS NULL OR "LeaseUntil" <= now())
  ORDER BY "NextAttemptAt" ASC, "Id" ASC
  FOR UPDATE SKIP LOCKED
  LIMIT $1
)
UPDATE ${EMAIL_REQUESTS_TABLE} AS request
SET
  "LeaseOwner" = $2,
  "LeaseUntil" = now() + ($3::double precision * interval '1 millisecond'),
  "LastAttemptAt" = now(),
  "RetryCount" = request."RetryCount" + 1
FROM candidates
WHERE request."Id" = candidates."Id"
RETURNING
  request."Id" AS id,
  request."RecipientEmail" AS "recipientEmail",
  request."RecipientUsername" AS "recipientUsername",
  request."EmailType" AS "emailType",
  request."IsSent" AS "isSent",
  request."Message" AS message,
  request."RetryCount" AS "retryCount",
  request."Subject" AS subject,
  request."Link" AS link,
  request."EstimatedWait" AS "estimatedWait",
  request."DateCreated" AS "dateCreated",
  request."LeaseOwner" AS "leaseOwner",
  request."LeaseUntil" AS "leaseUntil"`;

/**
 * Acknowledgement is conditional. A late sender must not mark a row sent
 * after its lease has been taken by another worker.
 */
export const ACK_EMAIL_SQL = `
UPDATE ${EMAIL_REQUESTS_TABLE}
SET
  "IsSent" = true,
  "LeaseOwner" = NULL,
  "LeaseUntil" = NULL,
  "LastError" = NULL,
  "NextAttemptAt" = now()
WHERE "Id" = $1
  AND "LeaseOwner" = $2
  AND "IsSent" = false
  AND "DeadLetteredAt" IS NULL
RETURNING "Id" AS id`;

/**
 * Failure is also conditional. RetryCount was incremented by the claim, so
 * reaching maxAttempts moves the row to the dead-letter state instead of
 * scheduling another attempt.
 */
export const FAIL_EMAIL_SQL = `
UPDATE ${EMAIL_REQUESTS_TABLE}
SET
  "LeaseOwner" = NULL,
  "LeaseUntil" = NULL,
  "LastError" = LEFT($3::text, 4000),
  "DeadLetteredAt" = CASE
    WHEN "RetryCount" >= $4 THEN COALESCE("DeadLetteredAt", now())
    ELSE NULL
  END,
  "NextAttemptAt" = CASE
    WHEN "RetryCount" >= $4 THEN now()
    ELSE now() + ($5::double precision * interval '1 millisecond')
  END
WHERE "Id" = $1
  AND "LeaseOwner" = $2
  AND "IsSent" = false
  AND "DeadLetteredAt" IS NULL
RETURNING
  "Id" AS id,
  ("DeadLetteredAt" IS NOT NULL) AS "deadLettered"`;

/**
 * A heartbeat never revives an expired lease. Returning no row tells the
 * caller that another worker may already own the delivery.
 */
export const HEARTBEAT_EMAIL_SQL = `
UPDATE ${EMAIL_REQUESTS_TABLE}
SET "LeaseUntil" = now() + ($3::double precision * interval '1 millisecond')
WHERE "Id" = $1
  AND "LeaseOwner" = $2
  AND "IsSent" = false
  AND "DeadLetteredAt" IS NULL
  AND "LeaseUntil" > now()
RETURNING "Id" AS id`;

/** Release uncompleted work on an orderly shutdown so another worker can pick it up. */
export const RELEASE_OWNER_LEASES_SQL = `
UPDATE ${EMAIL_REQUESTS_TABLE}
SET
  "LeaseOwner" = NULL,
  "LeaseUntil" = NULL
WHERE "LeaseOwner" = $1
  AND "IsSent" = false
  AND "DeadLetteredAt" IS NULL`;


import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  ACK_EMAIL_SQL,
  CLAIM_EMAILS_SQL,
  FAIL_EMAIL_SQL,
  HEARTBEAT_EMAIL_SQL,
  MARK_EXHAUSTED_SQL,
} from '../../src/modules/email/sql.mjs';

const migrationPath = new URL('../../migrations/20260910_email_delivery_leases.sql', import.meta.url);

test('claim contract uses the legacy table and transactional SKIP LOCKED semantics', () => {
  assert.match(CLAIM_EMAILS_SQL, /public\."EmailDeliveryRequests"/);
  assert.match(CLAIM_EMAILS_SQL, /FOR UPDATE\s+SKIP LOCKED/i);
  assert.match(CLAIM_EMAILS_SQL, /"LeaseOwner"\s*=\s*\$2/);
  assert.match(CLAIM_EMAILS_SQL, /"LeaseUntil"/);
  assert.match(CLAIM_EMAILS_SQL, /"RetryCount"\s*=\s*request\."RetryCount"\s*\+\s*1/);
  assert.match(CLAIM_EMAILS_SQL, /ORDER BY\s+"NextAttemptAt"\s+ASC,\s+"Id"\s+ASC/i);
  assert.doesNotMatch(CLAIM_EMAILS_SQL, /EmailDeliveryJobs/);
  assert.match(MARK_EXHAUSTED_SQL, /"DeadLetteredAt"/);
});

test('ack, fail, and heartbeat are guarded by id and lease owner', () => {
  for (const sql of [ACK_EMAIL_SQL, FAIL_EMAIL_SQL, HEARTBEAT_EMAIL_SQL]) {
    assert.match(sql, /WHERE\s+"Id"\s*=\s*\$1/i);
    assert.match(sql, /AND\s+"LeaseOwner"\s*=\s*\$2/i);
    assert.match(sql, /"IsSent"\s*=\s*false/i);
  }
});

test('migration is additive and initializes the lease schedule for existing rows', async () => {
  const migration = await readFile(migrationPath, 'utf8');
  assert.match(migration, /ALTER TABLE public\."EmailDeliveryRequests"/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "LeaseOwner"/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "DeadLetteredAt"/);
  assert.match(migration, /COALESCE\("NextAttemptAt",\s*"DateCreated",\s*now\(\)\)/);
  assert.match(migration, /ALTER COLUMN "NextAttemptAt" SET NOT NULL/);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS/);
  assert.doesNotMatch(migration, /DROP TABLE|RENAME TABLE|CREATE TABLE/i);
});


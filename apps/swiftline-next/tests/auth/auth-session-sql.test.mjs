import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../../migrations/20260911_auth_sessions.sql", import.meta.url), "utf8");

test("auth session migration stores only hashed refresh tokens and supports rotation", () => {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\."AuthSessions"/);
  assert.match(sql, /"RefreshTokenHash" char\(64\) NOT NULL UNIQUE/);
  assert.match(sql, /"FamilyId" uuid NOT NULL/);
  assert.match(sql, /"ReplacedBySessionId" uuid/);
  assert.match(sql, /"RevokedAt" timestamp with time zone/);
  assert.doesNotMatch(sql, /"RefreshToken"\s+(?:text|character varying)/);
});

test("auth session migration is additive and indexed", () => {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS "IX_AuthSessions_UserId_Active"/);
  assert.match(sql, /REFERENCES public\."AspNetUsers"\("Id"\) ON DELETE CASCADE/);
  assert.doesNotMatch(sql, /DROP TABLE|TRUNCATE|DELETE FROM/i);
});

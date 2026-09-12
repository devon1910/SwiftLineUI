import type { Pool, PoolClient, QueryResult } from "pg";
import { getDbPool } from "@/lib/db";
import type { AuthSessionRepository, AuthUser } from "./service";

type Db = Pick<Pool, "query" | "connect">;
type UserRow = { Id: string; Email: string | null; UserName: string | null; PasswordHash: string | null; EmailConfirmed: boolean; Roles: string[] | null };

const userSelect = `
  SELECT u."Id", u."Email", u."UserName", u."PasswordHash", u."EmailConfirmed",
         COALESCE(array_agg(r."Name") FILTER (WHERE r."Name" IS NOT NULL), '{}') AS "Roles"
  FROM public."AspNetUsers" u
  LEFT JOIN public."AspNetUserRoles" ur ON ur."UserId" = u."Id"
  LEFT JOIN public."AspNetRoles" r ON r."Id" = ur."RoleId"`;

function mapUser(row: UserRow | undefined): AuthUser | null {
  if (!row?.Email || !row.UserName) return null;
  return { id: row.Id, email: row.Email, username: row.UserName, passwordHash: row.PasswordHash, emailConfirmed: row.EmailConfirmed, roles: row.Roles ?? [] };
}

async function rollback(client: PoolClient) { try { await client.query("ROLLBACK"); } catch { /* preserve original error */ } }

export function createAuthRepository(db: Db = getDbPool()): AuthSessionRepository {
  return {
    async findUserByEmail(email) {
      const result = await db.query(`${userSelect} WHERE u."NormalizedEmail" = $1 GROUP BY u."Id"`, [email.trim().toUpperCase()]) as QueryResult<UserRow>;
      return mapUser(result.rows[0]);
    },

    async createSession(input) {
      await db.query(`INSERT INTO public."AuthSessions"
        ("UserId", "RefreshTokenHash", "ExpiresAt", "UserAgent", "IpAddress")
        VALUES ($1, $2, $3, $4, $5)`, [input.userId, input.refreshTokenHash, input.expiresAt, input.userAgent ?? null, input.ipAddress ?? null]);
    },

    async rotateSession(input) {
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        const current = await client.query(`SELECT s.*, u."Email", u."UserName", u."PasswordHash", u."EmailConfirmed"
          FROM public."AuthSessions" s JOIN public."AspNetUsers" u ON u."Id" = s."UserId"
          WHERE s."RefreshTokenHash" = $1 FOR UPDATE OF s`, [input.currentHash]);
        const row = current.rows[0];
        if (!row) { await client.query("ROLLBACK"); return null; }
        if (row.RotatedAt || row.RevokedAt || new Date(row.ExpiresAt) <= new Date()) {
          await client.query(`UPDATE public."AuthSessions" SET "RevokedAt" = COALESCE("RevokedAt", now()), "RevocationReason" = COALESCE("RevocationReason", 'refresh-token-reuse') WHERE "FamilyId" = $1`, [row.FamilyId]);
          await client.query("COMMIT");
          return null;
        }
        const roles = await client.query(`SELECT COALESCE(array_agg(r."Name") FILTER (WHERE r."Name" IS NOT NULL), '{}') AS "Roles" FROM public."AspNetUserRoles" ur JOIN public."AspNetRoles" r ON r."Id" = ur."RoleId" WHERE ur."UserId" = $1`, [row.UserId]);
        const replacement = await client.query(`INSERT INTO public."AuthSessions" ("UserId", "FamilyId", "RefreshTokenHash", "ExpiresAt", "UserAgent", "IpAddress") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "Id"`, [row.UserId, row.FamilyId, input.replacementHash, input.expiresAt, input.userAgent ?? null, input.ipAddress ?? null]);
        await client.query(`UPDATE public."AuthSessions" SET "RotatedAt" = now(), "ReplacedBySessionId" = $2 WHERE "Id" = $1`, [row.Id, replacement.rows[0].Id]);
        await client.query("COMMIT");
        return mapUser({ Id: row.UserId, Email: row.Email, UserName: row.UserName, PasswordHash: row.PasswordHash, EmailConfirmed: row.EmailConfirmed, Roles: roles.rows[0]?.Roles ?? [] });
      } catch (error) { await rollback(client); throw error; } finally { client.release(); }
    },

    async revokeAllForUser(userId, reason) {
      await db.query(`UPDATE public."AuthSessions" SET "RevokedAt" = COALESCE("RevokedAt", now()), "RevocationReason" = COALESCE("RevocationReason", $2) WHERE "UserId" = $1 AND "RevokedAt" IS NULL`, [userId, reason]);
    },
  };
}

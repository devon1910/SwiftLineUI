import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(root, "migrations");
const names = (await readdir(migrationsDir)).filter((name) => /^\d{8}_[a-z0-9_-]+\.sql$/i.test(name)).sort();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
try {
  await client.query("SELECT pg_advisory_lock($1)", [763_948_211]);
  await client.query(`CREATE TABLE IF NOT EXISTS public."_NextMigrations" ("Name" text PRIMARY KEY, "Sha256" char(64) NOT NULL, "AppliedAt" timestamptz NOT NULL DEFAULT now())`);
  for (const name of names) {
    const sql = await readFile(join(migrationsDir, name), "utf8");
    const sha256 = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query(`SELECT "Sha256" FROM public."_NextMigrations" WHERE "Name" = $1`, [name]);
    if (existing.rows[0]) {
      if (existing.rows[0].Sha256 !== sha256) throw new Error(`Applied migration changed: ${name}`);
      console.log(`already applied: ${name}`);
      continue;
    }
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(`INSERT INTO public."_NextMigrations" ("Name", "Sha256") VALUES ($1, $2)`, [name, sha256]);
      await client.query("COMMIT");
      console.log(`applied: ${name}`);
    } catch (error) { await client.query("ROLLBACK"); throw error; }
  }
} finally {
  await client.query("SELECT pg_advisory_unlock($1)", [763_948_211]).catch(() => {});
  await client.end();
}

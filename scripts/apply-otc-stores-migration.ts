/**
 * Apply otc_stores table migration via direct Postgres connection.
 *
 * Requires DB_PASSWORD in .env or .env.local (or DATABASE_URL).
 *
 * Usage: npm run db:migrate-otc
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";
import { loadEnv } from "./load-env";

loadEnv();

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password = process.env.DB_PASSWORD;
  const ref = process.env.SUPABASE_PROJECT_REF ?? "ogncclsnjprlouccngeg";

  if (!password) {
    console.error(
      "Set DB_PASSWORD or DATABASE_URL in .env.local to run migrations."
    );
    process.exit(1);
  }

  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${ref}:${encoded}@aws-1-us-east-2.pooler.supabase.com:6543/postgres`;
}

async function main() {
  const sqlPath = resolve(
    process.cwd(),
    "supabase/migrations/20250620000000_otc_stores.sql"
  );
  const sql = readFileSync(sqlPath, "utf-8");

  const client = new pg.Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  console.log("Applying otc_stores migration…");

  try {
    await client.query(sql);
    console.log("Migration applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});

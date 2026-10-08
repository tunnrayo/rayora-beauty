import pg from "pg";
import { env } from "../config/env.js";

if (!env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to apps/api/.env");
  process.exit(1);
}

// Postgres returns bigint (money in kobo) as text by default. Convert to a normal number.
pg.types.setTypeParser(20, (value) => Number(value));

// Railway's public proxy address needs SSL; its private network address does not.
const needsSsl = env.DATABASE_URL.includes("rlwy.net");

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import pg from "pg";
import * as schema from "./schema";

export * from "./seed-data";
export { schema };

/**
 * Any Drizzle Postgres database with our schema. Production uses node-postgres;
 * tests use PGlite (Postgres compiled to WebAssembly, runs in memory, no Docker).
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Connect to Postgres using DATABASE_URL. */
export function connect(url = process.env.DATABASE_URL): { db: Db; close: () => Promise<void> } {
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  const pool = new pg.Pool({ connectionString: url, max: 10 });
  const db = drizzle(pool, { schema });
  return { db, close: () => pool.end() };
}

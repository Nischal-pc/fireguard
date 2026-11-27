/**
 * Apply all pending migrations in ./drizzle to DATABASE_URL.
 * Run with: pnpm db:migrate   (after `pnpm db:up` for local Postgres)
 */
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { connect } from "./index";

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
const { db, close } = connect();
try {
  // biome-ignore lint/suspicious/noExplicitAny: node-postgres migrator needs its own db type
  await migrate(db as any, { migrationsFolder });
  console.log("Migrations applied.");
} finally {
  await close();
}

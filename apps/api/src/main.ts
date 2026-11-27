/**
 * Start the API against DATABASE_URL.
 *   pnpm --filter @fireguard/api dev
 */
import { connect } from "@fireguard/db";
import { buildServer } from "./server";

const { db, close } = connect();
const app = buildServer({ db, logger: true });

const port = Number(process.env.API_PORT ?? 3000);
const host = process.env.API_HOST ?? "0.0.0.0";

const shutdown = async () => {
  await app.close();
  await close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port, host });

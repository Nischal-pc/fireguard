/**
 * Load test-data/sample-site.json (or a file you name) into DATABASE_URL.
 *   pnpm db:seed
 *   pnpm db:seed -- ../../test-data/big-site.json
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { connect, type SiteFixture, seedSite } from "./index";

const defaultFile = fileURLToPath(new URL("../../../test-data/sample-site.json", import.meta.url));
// pnpm may pass a literal "--" before the file name; skip it.
const fileArg = process.argv.slice(2).find((a) => a !== "--");
const file = fileArg ? resolve(fileArg) : defaultFile;
const fixture = JSON.parse(readFileSync(file, "utf8")) as SiteFixture;

const { db, close } = connect();
try {
  const { devices } = await seedSite(db, fixture);
  console.log(
    `Seeded ${fixture.site.name}: work order ${fixture.workOrder.softrendWo}, ${devices} devices.`,
  );
} finally {
  await close();
}

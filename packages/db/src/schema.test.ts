import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Db, SiteFixture } from "./index";
import { seedSite } from "./index";
import { devices, workOrders } from "./schema";
import { createTestDb } from "./testing";

const fixture = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../test-data/sample-site.json", import.meta.url)),
    "utf8",
  ),
) as SiteFixture;

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(async () => close());

describe("database", () => {
  it("migrations apply to a fresh Postgres", async () => {
    const [row] = await db.select({ n: count() }).from(workOrders);
    expect(row?.n).toBe(0);
  });

  it("seeds the sample site", async () => {
    await seedSite(db, fixture);
    const [wo] = await db.select().from(workOrders).where(eq(workOrders.softrendWo, "SAMPLE-0001"));
    expect(wo?.coordinatorNote).toBe("Morning arrival only.");
    const [d] = await db.select({ n: count() }).from(devices);
    expect(d?.n).toBe(fixture.devices.length);
  });

  it("seeding twice does not duplicate anything", async () => {
    await seedSite(db, fixture);
    const [d] = await db.select({ n: count() }).from(devices);
    expect(d?.n).toBe(fixture.devices.length);
  });
});

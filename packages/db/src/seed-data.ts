import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Shape of test-data/*.json produced by scripts/make-big-site.mjs. */
export interface SiteFixture {
  branch: { id: string; name: string; province: "SK" | "AB" | "BC" };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: "technician" | "coordinator" | "branch_manager" | "admin";
    certifications: string[];
  }>;
  customer: { id: string; softrendId: string; name: string; billingEmail?: string };
  site: {
    id: string;
    softrendId: string;
    name: string;
    address?: string;
    city?: string;
    province: "SK" | "AB" | "BC";
    accessNotes?: string;
  };
  workOrder: {
    id: string;
    softrendWo: string;
    scheduledAt: string;
    estHours?: string;
    coordinatorNote?: string;
  };
  woDisciplines: Array<{ id: string; discipline: "FA" | "FE" | "EL" | "EX"; templateId: string }>;
  devices: Array<{
    id: string;
    seq: number;
    discipline: "FA" | "FE" | "EL" | "EX";
    barcode: string;
    location: string;
    attributes: Record<string, unknown>;
  }>;
}

/**
 * Load one site fixture into a database. Safe to run twice: rows that already
 * exist are skipped. Used by `pnpm db:seed` and by tests.
 */
export async function seedSite(db: AnyDb, f: SiteFixture): Promise<{ devices: number }> {
  const tech = f.users.find((u) => u.role === "technician");
  await db.transaction(async (tx) => {
    await tx.insert(schema.branches).values(f.branch).onConflictDoNothing();
    await tx
      .insert(schema.users)
      .values(f.users.map((u) => ({ ...u, branchId: f.branch.id })))
      .onConflictDoNothing();
    await tx.insert(schema.customers).values(f.customer).onConflictDoNothing();
    await tx
      .insert(schema.sites)
      .values({ ...f.site, customerId: f.customer.id })
      .onConflictDoNothing();
    await tx
      .insert(schema.workOrders)
      .values({
        ...f.workOrder,
        scheduledAt: new Date(f.workOrder.scheduledAt),
        siteId: f.site.id,
        branchId: f.branch.id,
      })
      .onConflictDoNothing();
    if (tech) {
      await tx
        .insert(schema.workOrderTechs)
        .values({ workOrderId: f.workOrder.id, userId: tech.id })
        .onConflictDoNothing();
    }
    await tx
      .insert(schema.woDisciplines)
      .values(f.woDisciplines.map((d) => ({ ...d, workOrderId: f.workOrder.id })))
      .onConflictDoNothing();
    // Insert devices in chunks: big sites have thousands.
    for (let i = 0; i < f.devices.length; i += 500) {
      const chunk = f.devices.slice(i, i + 500).map((d) => ({ ...d, siteId: f.site.id }));
      await tx.insert(schema.devices).values(chunk).onConflictDoNothing();
    }
  });
  return { devices: f.devices.length };
}

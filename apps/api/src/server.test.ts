import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type Db, type SiteFixture, schema, seedSite } from "@fireguard/db";
import { createTestDb } from "@fireguard/db/testing";
import { type CrudEntry, jobPackSchema, newId } from "@fireguard/shared";
import { count, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "./server";

const fixture = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../test-data/sample-site.json", import.meta.url)),
    "utf8",
  ),
) as SiteFixture;
const tech = fixture.users.find((u) => u.role === "technician");
if (!tech) throw new Error("fixture needs a technician");
const techId = tech.id;
const woDisciplineId = fixture.woDisciplines[0]?.id ?? "";

let db: Db;
let close: () => Promise<void>;
let app: FastifyInstance;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  await seedSite(db, fixture);
  app = buildServer({ db });
});
afterAll(async () => {
  await app.close();
  await close();
});

const now = () => new Date().toISOString();

function upload(entries: CrudEntry[]) {
  return app.inject({
    method: "POST",
    url: "/sync/upload",
    headers: { "x-user-id": techId },
    payload: { client_id: "test-tablet", entries },
  });
}

function startInspection(id: string): CrudEntry {
  return {
    op: "PUT",
    table: "inspections",
    id,
    data: {
      wo_discipline_id: woDisciplineId,
      template_id: "FE-SK-v1",
      status: "in_progress",
      tech_id: techId,
      started_at: now(),
    },
  };
}

function allAnswersYes(inspectionId: string): CrudEntry[] {
  const keys = [
    "all_areas_accessible",
    "dry_chem_after_1984",
    "co2_after_1955",
    "correct_classification",
    "recalled_removed",
    "travel_distance_ok",
  ];
  return keys.map((k) => ({
    op: "PUT" as const,
    table: "answers",
    id: newId(),
    data: {
      inspection_id: inspectionId,
      question_key: k,
      value: "yes",
      tech_id: techId,
      answered_at: now(),
    },
  }));
}

function passDevice(inspectionId: string, deviceId: string): CrudEntry {
  return {
    op: "PUT",
    table: "device_results",
    id: newId(),
    data: {
      inspection_id: inspectionId,
      device_id: deviceId,
      result: "pass",
      readings: {},
      tech_id: techId,
      tested_at: now(),
    },
  };
}

describe("API", () => {
  it("GET /health", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
  });

  it("requires sign-in", async () => {
    const res = await app.inject({ method: "GET", url: "/work-orders/SAMPLE-0001/pack" });
    expect(res.statusCode).toBe(401);
  });

  it("returns the job pack with template and devices in sequence order", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/work-orders/SAMPLE-0001/pack",
      headers: { "x-user-id": techId },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.disciplines).toHaveLength(1);
    expect(body.disciplines[0].template.id).toBe("FE-SK-v1");
    expect(body.disciplines[0].devices).toHaveLength(fixture.devices.length);
    expect(body.disciplines[0].devices[0].location).toBe("Bleed-off truck, NH3 site");
    expect(body.disciplines[0].progress.percentComplete).toBe(0);
  });

  it("matches the shape the tablet validates (jobPackSchema)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/work-orders/SAMPLE-0001/pack",
      headers: { "x-user-id": techId },
    });
    expect(jobPackSchema.safeParse(res.json()).error).toBeUndefined();
  });
});

describe("POST /sync/upload", () => {
  it("applies valid entries and writes the audit log", async () => {
    const inspectionId = newId();
    const res = await upload([startInspection(inspectionId), ...allAnswersYes(inspectionId)]);
    expect(res.json()).toEqual({ applied: 7, rejected: [] });
    const [audit] = await db.select({ n: count() }).from(schema.auditLog);
    expect(audit?.n).toBeGreaterThanOrEqual(7);
  });

  it("is idempotent: the same batch twice gives the same data", async () => {
    const inspectionId = newId();
    const batch = [startInspection(inspectionId)];
    await upload(batch);
    const second = await upload(batch);
    expect(second.json().applied).toBe(1);
    const [row] = await db
      .select()
      .from(schema.inspections)
      .where(eq(schema.inspections.id, inspectionId));
    expect(row?.version).toBe(2);
  });

  it("rejects a bad entry but still applies the rest of the batch", async () => {
    const inspectionId = newId();
    const res = await upload([
      startInspection(inspectionId),
      { op: "PUT", table: "work_orders", id: newId(), data: {} },
      passDevice(inspectionId, newId()), // device does not exist
    ]);
    const body = res.json();
    expect(body.applied).toBe(1);
    expect(body.rejected).toHaveLength(2);
    expect(body.rejected[0].error).toContain("cannot be written from a tablet");
  });

  it("refuses to close an inspection with untested devices", async () => {
    const inspectionId = newId();
    await upload([startInspection(inspectionId), ...allAnswersYes(inspectionId)]);
    const res = await upload([
      {
        op: "PATCH",
        table: "inspections",
        id: inspectionId,
        data: { status: "completed", completed_at: now() },
      },
    ]);
    const body = res.json();
    expect(body.applied).toBe(0);
    expect(body.rejected[0].error).toMatch(/cannot close: 40 blocker\(s\) \(device_untested\)/);
    const [row] = await db
      .select()
      .from(schema.inspections)
      .where(eq(schema.inspections.id, inspectionId));
    expect(row?.status).toBe("in_progress");
  });

  it("closes an inspection once every device passes", async () => {
    const inspectionId = newId();
    const results = fixture.devices.map((d) => passDevice(inspectionId, d.id));
    const res = await upload([
      startInspection(inspectionId),
      ...allAnswersYes(inspectionId),
      ...results,
      {
        op: "PATCH",
        table: "inspections",
        id: inspectionId,
        data: { status: "completed", completed_at: now() },
      },
    ]);
    expect(res.json()).toEqual({ applied: 7 + fixture.devices.length + 1, rejected: [] });
    const [row] = await db
      .select()
      .from(schema.inspections)
      .where(eq(schema.inspections.id, inspectionId));
    expect(row?.status).toBe("completed");
  });

  it("returns 400 for a malformed batch", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/sync/upload",
      headers: { "x-user-id": techId },
      payload: { entries: "nope" },
    });
    expect(res.statusCode).toBe(400);
  });
});

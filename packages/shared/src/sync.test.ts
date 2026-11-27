import { describe, expect, it } from "vitest";
import { newId } from "./ids";
import { checkEntry, syncUploadBatch } from "./sync";

const now = new Date().toISOString();

describe("checkEntry", () => {
  it("accepts a valid device result", () => {
    const res = checkEntry({
      op: "PUT",
      table: "device_results",
      id: newId(),
      data: {
        inspection_id: newId(),
        device_id: newId(),
        result: "pass",
        readings: { gauge_ok: true },
        tech_id: newId(),
        tested_at: now,
      },
    });
    expect(res.ok).toBe(true);
  });

  it("rejects tables the tablet does not own", () => {
    const res = checkEntry({ op: "PUT", table: "work_orders", id: newId(), data: {} });
    expect(res).toEqual({
      ok: false,
      error: 'Table "work_orders" cannot be written from a tablet',
    });
  });

  it("rejects a bad result value and says where", () => {
    const res = checkEntry({
      op: "PUT",
      table: "device_results",
      id: newId(),
      data: {
        inspection_id: newId(),
        device_id: newId(),
        result: "maybe",
        tech_id: newId(),
        tested_at: now,
      },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("device_results.result");
  });

  it("checks PATCH against a partial schema", () => {
    const res = checkEntry({ op: "PATCH", table: "answers", id: newId(), data: { value: "no" } });
    expect(res.ok).toBe(true);
  });

  it("allows DELETE with no data", () => {
    const res = checkEntry({ op: "DELETE", table: "deficiencies", id: newId() });
    expect(res).toMatchObject({ ok: true, data: null });
  });
});

describe("syncUploadBatch", () => {
  it("refuses an empty batch", () => {
    expect(syncUploadBatch.safeParse({ client_id: "tab-1", entries: [] }).success).toBe(false);
  });
});

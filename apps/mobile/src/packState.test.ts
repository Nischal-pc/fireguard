import { describe, expect, it } from "vitest";
import type { JobPack } from "./api";
import {
  allDevices,
  checkSettings,
  initialPackState,
  MISSING_SETTINGS,
  packReducer,
} from "./packState";

const device = (id: string, seq: number) => ({
  id,
  seq,
  barcode: null,
  location: null,
  attributes: {},
});
const pack = {
  workOrder: {
    softrendWo: "SAMPLE-0001",
    scheduledAt: "2026-12-01T15:00:00Z",
    coordinatorNote: null,
  },
  site: { name: "Site", address: null, city: null, accessNotes: null },
  disciplines: [{ devices: [device("a", 1), device("b", 2)] }, { devices: [device("c", 1)] }],
} as unknown as JobPack;

describe("packReducer", () => {
  it("starts in loading", () => {
    expect(initialPackState).toEqual({ kind: "loading" });
  });

  it("shows the pack when the load succeeds", () => {
    expect(packReducer(initialPackState, { type: "loaded", result: { ok: true, pack } })).toEqual({
      kind: "ready",
      pack,
    });
  });

  it("shows the error message when the load fails", () => {
    expect(
      packReducer(initialPackState, {
        type: "loaded",
        result: { ok: false, error: "Can't reach server" },
      }),
    ).toEqual({ kind: "error", message: "Can't reach server" });
  });

  it("goes back to loading on Retry", () => {
    expect(packReducer({ kind: "error", message: "x" }, { type: "load" })).toEqual({
      kind: "loading",
    });
  });
});

describe("checkSettings", () => {
  const full = { apiUrl: "http://172.16.1.70:3000", userId: "u", workOrder: "SAMPLE-0001" };

  it("passes when every value is set", () => {
    expect(checkSettings(full)).toEqual({ ok: true, ...full });
  });

  it.each(["apiUrl", "userId", "workOrder"] as const)("fails when %s is missing", (key) => {
    expect(checkSettings({ ...full, [key]: undefined })).toEqual({
      ok: false,
      error: MISSING_SETTINGS,
    });
  });

  it("treats an empty value as missing", () => {
    expect(checkSettings({ ...full, apiUrl: "" }).ok).toBe(false);
  });
});

describe("allDevices", () => {
  it("lists devices from every discipline in order", () => {
    expect(allDevices(pack).map((d) => d.id)).toEqual(["a", "b", "c"]);
  });
});

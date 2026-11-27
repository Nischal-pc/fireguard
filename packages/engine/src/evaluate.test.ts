import { describe, expect, it } from "vitest";
import { evaluateInspection, resultFromChecks } from "./evaluate";
import { parseTemplate, type Template } from "./template";

// A small template made just for these tests, so the engine's tests never
// depend on real template wording that a technician may change.
const template: Template = parseTemplate({
  id: "FE-SK-v1",
  discipline: "FE",
  province: "SK",
  version: 1,
  title: "Test",
  standard: "Test",
  status: "draft",
  questions: [
    {
      key: "accessible",
      text: "All areas accessible?",
      required: true,
      onNo: { severity: "code_violation", suggestedDescription: "x" },
    },
    { key: "optional_q", text: "Optional", required: false },
  ],
  deviceFields: [],
  deviceChecks: [
    { key: "gauge_ok", text: "Gauge ok" },
    { key: "seal_ok", text: "Seal ok" },
  ],
  rules: { photoRequiredOnFail: true, allDevicesRequired: true },
});

const D1 = "d1";
const D2 = "d2";

describe("evaluateInspection", () => {
  it("starts at 0% with every required item blocking", () => {
    const e = evaluateInspection({ template, deviceIds: [D1, D2], answers: [], deviceResults: [] });
    expect(e.percentComplete).toBe(0);
    expect(e.canClose).toBe(false);
    expect(e.blockers).toHaveLength(3); // 1 question + 2 devices
  });

  it("can close when everything passes", () => {
    const e = evaluateInspection({
      template,
      deviceIds: [D1, D2],
      answers: [{ questionKey: "accessible", value: "yes" }],
      deviceResults: [
        { deviceId: D1, result: "pass", photoCount: 0 },
        { deviceId: D2, result: "pass", photoCount: 0 },
      ],
    });
    expect(e).toMatchObject({ percentComplete: 100, passed: 2, canClose: true, blockers: [] });
  });

  it("blocks a failed device with no photo and suggests a deficiency", () => {
    const e = evaluateInspection({
      template,
      deviceIds: [D1],
      answers: [{ questionKey: "accessible", value: "yes" }],
      deviceResults: [{ deviceId: D1, result: "fail", photoCount: 0 }],
    });
    expect(e.blockers).toEqual([{ kind: "fail_without_photo", deviceId: D1 }]);
    expect(e.suggestions).toEqual([{ kind: "deficiency_for_device", deviceId: D1 }]);
    expect(e.canClose).toBe(false);
  });

  it("stops suggesting a deficiency once one exists", () => {
    const e = evaluateInspection({
      template,
      deviceIds: [D1],
      answers: [{ questionKey: "accessible", value: "no" }],
      deviceResults: [{ deviceId: D1, result: "fail", photoCount: 1 }],
      deficiencyFor: { questionKeys: ["accessible"], deviceIds: [D1] },
    });
    expect(e.suggestions).toEqual([]);
    expect(e.canClose).toBe(true);
  });

  it("requires a note when a device is not tested", () => {
    const e = evaluateInspection({
      template,
      deviceIds: [D1],
      answers: [{ questionKey: "accessible", value: "yes" }],
      deviceResults: [{ deviceId: D1, result: "not_tested", photoCount: 0, note: "  " }],
    });
    expect(e.blockers).toEqual([{ kind: "not_tested_without_note", deviceId: D1 }]);
  });

  it("uses the latest answer when a question is answered twice", () => {
    const e = evaluateInspection({
      template,
      deviceIds: [],
      answers: [
        { questionKey: "accessible", value: "no" },
        { questionKey: "accessible", value: "yes" },
      ],
      deviceResults: [],
    });
    expect(e.suggestions).toEqual([]);
  });

  it("stays fast on a 1,000-device site", () => {
    const ids = Array.from({ length: 1000 }, (_, i) => `d${i}`);
    const results = ids.map((id) => ({ deviceId: id, result: "pass" as const, photoCount: 0 }));
    const start = Date.now();
    const e = evaluateInspection({
      template,
      deviceIds: ids,
      answers: [{ questionKey: "accessible", value: "yes" }],
      deviceResults: results,
    });
    expect(e.canClose).toBe(true);
    expect(Date.now() - start).toBeLessThan(50); // budget: under 50 ms per tap
  });
});

describe("resultFromChecks", () => {
  it("fails if any check fails", () => {
    expect(resultFromChecks(template, { gauge_ok: true, seal_ok: false })).toEqual({
      result: "fail",
      failedChecks: ["seal_ok"],
    });
  });
  it("is not_tested until every check is answered", () => {
    expect(resultFromChecks(template, { gauge_ok: true }).result).toBe("not_tested");
  });
  it("passes when every check passes", () => {
    expect(resultFromChecks(template, { gauge_ok: true, seal_ok: true }).result).toBe("pass");
  });
});

describe("parseTemplate", () => {
  it("rejects duplicate keys", () => {
    expect(() =>
      parseTemplate({ ...template, questions: [template.questions[0], template.questions[0]] }),
    ).toThrow(/Duplicate question key/);
  });
  it("rejects a published template with no approver", () => {
    expect(() => parseTemplate({ ...template, status: "published" })).toThrow(/approvedBy/);
  });
  it("rejects an id that does not match discipline, province and version", () => {
    expect(() => parseTemplate({ ...template, id: "FE-AB-v1" })).toThrow(/should be "FE-SK-v1"/);
  });
});

import { describe, expect, it } from "vitest";
import { getTemplate, latestTemplate, TEMPLATES } from "./index";

describe("templates", () => {
  it("all templates load and pass validation", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
  });

  it("FE-SK-v1 has the six building questions from the current Softrend form", () => {
    const t = getTemplate("FE-SK-v1");
    expect(t.questions.map((q) => q.key)).toEqual([
      "all_areas_accessible",
      "dry_chem_after_1984",
      "co2_after_1955",
      "correct_classification",
      "recalled_removed",
      "travel_distance_ok",
    ]);
  });

  it("drafts are hidden unless asked for", () => {
    expect(latestTemplate("FE", "SK", { includeDrafts: false })).toBeUndefined();
    expect(latestTemplate("FE", "SK", { includeDrafts: true })?.id).toBe("FE-SK-v1");
  });
});

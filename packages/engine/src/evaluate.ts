import type { AnswerValue, DeviceResultValue } from "@fireguard/shared";
import type { Template } from "./template";

/**
 * The inspection engine's core: given a template and what the technician has
 * recorded so far, work out progress, what is missing, and whether the
 * inspection can be closed.
 *
 * This is a pure function: no database, no screens, no network. The tablet
 * calls it on every change to draw progress; the server calls it again before
 * accepting a close. Same code, same answer, everywhere.
 */

export interface RecordedAnswer {
  questionKey: string;
  value: AnswerValue;
}

export interface RecordedDeviceResult {
  deviceId: string;
  result: DeviceResultValue;
  /** Check keys that failed (from template.deviceChecks). */
  failedChecks?: string[];
  photoCount: number;
  /** A note is required when a device is marked not_tested. */
  note?: string | null;
}

export interface EvaluationInput {
  template: Template;
  /** Ids of all active devices for this discipline at the site. */
  deviceIds: string[];
  answers: RecordedAnswer[];
  deviceResults: RecordedDeviceResult[];
  /** Question keys and device ids that already have a deficiency recorded. */
  deficiencyFor?: { questionKeys: string[]; deviceIds: string[] };
}

export type Blocker =
  | { kind: "question_unanswered"; questionKey: string }
  | { kind: "device_untested"; deviceId: string }
  | { kind: "not_tested_without_note"; deviceId: string }
  | { kind: "fail_without_photo"; deviceId: string };

export type Suggestion =
  | { kind: "deficiency_for_question"; questionKey: string }
  | { kind: "deficiency_for_device"; deviceId: string };

export interface Evaluation {
  /** 0 to 100, counting required questions plus devices. */
  percentComplete: number;
  answeredQuestions: number;
  requiredQuestions: number;
  testedDevices: number;
  totalDevices: number;
  passed: number;
  failed: number;
  notTested: number;
  /** Things that must be fixed before the inspection can be closed. */
  blockers: Blocker[];
  /** Things the app should offer (never forces) — e.g. "create a deficiency?". */
  suggestions: Suggestion[];
  canClose: boolean;
}

export function evaluateInspection(input: EvaluationInput): Evaluation {
  const { template, deviceIds, answers, deviceResults } = input;
  const deficiencyQuestions = new Set(input.deficiencyFor?.questionKeys ?? []);
  const deficiencyDevices = new Set(input.deficiencyFor?.deviceIds ?? []);

  // Latest answer per question wins (the tablet may change its mind).
  const answerByKey = new Map<string, AnswerValue>();
  for (const a of answers) answerByKey.set(a.questionKey, a.value);

  const resultByDevice = new Map<string, RecordedDeviceResult>();
  for (const r of deviceResults) resultByDevice.set(r.deviceId, r);

  const blockers: Blocker[] = [];
  const suggestions: Suggestion[] = [];

  const required = template.questions.filter((q) => q.required);
  let answeredRequired = 0;
  for (const q of template.questions) {
    const value = answerByKey.get(q.key);
    if (value === undefined) {
      if (q.required) blockers.push({ kind: "question_unanswered", questionKey: q.key });
      continue;
    }
    if (q.required) answeredRequired++;
    if (value === "no" && q.onNo && !deficiencyQuestions.has(q.key)) {
      suggestions.push({ kind: "deficiency_for_question", questionKey: q.key });
    }
  }

  let passed = 0;
  let failed = 0;
  let notTested = 0;
  for (const deviceId of deviceIds) {
    const r = resultByDevice.get(deviceId);
    if (!r) {
      if (template.rules.allDevicesRequired) blockers.push({ kind: "device_untested", deviceId });
      continue;
    }
    if (r.result === "pass") passed++;
    if (r.result === "fail") {
      failed++;
      if (template.rules.photoRequiredOnFail && r.photoCount < 1) {
        blockers.push({ kind: "fail_without_photo", deviceId });
      }
      if (!deficiencyDevices.has(deviceId)) {
        suggestions.push({ kind: "deficiency_for_device", deviceId });
      }
    }
    if (r.result === "not_tested") {
      notTested++;
      if (!r.note?.trim()) blockers.push({ kind: "not_tested_without_note", deviceId });
    }
  }

  const tested = passed + failed + notTested;
  const totalUnits = required.length + deviceIds.length;
  const doneUnits = answeredRequired + tested;
  const percentComplete = totalUnits === 0 ? 100 : Math.round((doneUnits / totalUnits) * 100);

  return {
    percentComplete,
    answeredQuestions: answeredRequired,
    requiredQuestions: required.length,
    testedDevices: tested,
    totalDevices: deviceIds.length,
    passed,
    failed,
    notTested,
    blockers,
    suggestions,
    canClose: blockers.length === 0,
  };
}

/** A device passes only if every check passes. */
export function resultFromChecks(
  template: Template,
  checks: Record<string, boolean>,
): { result: DeviceResultValue; failedChecks: string[] } {
  const failedChecks = template.deviceChecks
    .filter((c) => checks[c.key] === false)
    .map((c) => c.key);
  const allAnswered = template.deviceChecks.every((c) => typeof checks[c.key] === "boolean");
  if (failedChecks.length > 0) return { result: "fail", failedChecks };
  if (!allAnswered) return { result: "not_tested", failedChecks: [] };
  return { result: "pass", failedChecks: [] };
}

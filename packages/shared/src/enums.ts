/**
 * Closed sets used across the whole platform.
 * Add a value here first; the database, API and apps all read from this file.
 */

/** Inspection disciplines. FA fire alarm, FE fire extinguisher, EL emergency lighting, EX exit signs. */
export const DISCIPLINES = ["FA", "FE", "EL", "EX"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const DISCIPLINE_NAMES: Record<Discipline, string> = {
  FA: "Fire Alarm",
  FE: "Fire Extinguisher",
  EL: "Emergency Lighting",
  EX: "Exit Signs",
};

/** Provinces we operate in. Templates are versioned per province. */
export const PROVINCES = ["SK", "AB", "BC"] as const;
export type Province = (typeof PROVINCES)[number];

export const ROLES = ["technician", "coordinator", "branch_manager", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Result of testing one device on one visit. */
export const DEVICE_RESULTS = ["pass", "fail", "not_tested"] as const;
export type DeviceResultValue = (typeof DEVICE_RESULTS)[number];

/** Answer to a building-level question. */
export const ANSWER_VALUES = ["yes", "no", "na"] as const;
export type AnswerValue = (typeof ANSWER_VALUES)[number];

export const SEVERITIES = ["life_safety", "code_violation", "cosmetic"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const WORK_ORDER_STATUSES = [
  "scheduled",
  "confirmed",
  "on_site",
  "completed",
  "cancelled",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export const INSPECTION_STATUSES = ["not_started", "in_progress", "completed"] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const DEFICIENCY_STATUSES = ["open", "quoted", "repaired", "closed"] as const;
export type DeficiencyStatus = (typeof DEFICIENCY_STATUSES)[number];

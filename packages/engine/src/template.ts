import { DISCIPLINES, PROVINCES, SEVERITIES } from "@fireguard/shared";
import { z } from "zod";

/**
 * A template describes one discipline's inspection for one province and one
 * edition of the governing standard. The app draws every inspection screen
 * from a template, so adding a discipline is data, not new screens.
 *
 * Published templates never change. A fix means a new version; an inspection
 * started on version 1 finishes on version 1.
 */

/** A building-level question with a Yes / No / N/A answer. */
export const questionSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/, "keys are lower_snake_case"),
  text: z.string().min(1),
  /** Short code reference shown behind the info icon. */
  reference: z.string().optional(),
  required: z.boolean().default(true),
  /** If the answer is "no", the tech is asked to create a deficiency with this default. */
  onNo: z
    .object({
      severity: z.enum(SEVERITIES),
      suggestedDescription: z.string(),
    })
    .optional(),
});

/** A field recorded on each device (identity data like size, or a reading like voltage). */
export const deviceFieldSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/),
  label: z.string(),
  type: z.enum(["text", "number", "year", "select", "boolean"]),
  options: z.array(z.string()).optional(),
  unit: z.string().optional(),
  /** identity = describes the device and carries over to next visit; reading = recorded each visit. */
  kind: z.enum(["identity", "reading"]),
  required: z.boolean().default(false),
});

/** A pass/fail check done on each device. Any failed check fails the device. */
export const deviceCheckSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/),
  text: z.string(),
  onFail: z
    .object({
      severity: z.enum(SEVERITIES),
      suggestedDescription: z.string(),
    })
    .optional(),
});

export const templateSchema = z.object({
  id: z.string().regex(/^[A-Z]{2}-[A-Z]{2}-v\d+$/, 'ids look like "FE-SK-v1"'),
  discipline: z.enum(DISCIPLINES),
  province: z.enum(PROVINCES),
  version: z.number().int().positive(),
  title: z.string(),
  /** The standard and edition this template follows, as adopted in the province. */
  standard: z.string(),
  /** draft templates load in dev and staging only. */
  status: z.enum(["draft", "published"]),
  /** Who signed off the content (a senior technician), required to publish. */
  approvedBy: z.string().optional(),
  questions: z.array(questionSchema),
  deviceFields: z.array(deviceFieldSchema),
  deviceChecks: z.array(deviceCheckSchema).min(1),
  rules: z.object({
    /** A failed device cannot be saved as final without at least one photo. */
    photoRequiredOnFail: z.boolean(),
    /** Every device must be tested (or marked not tested with a note) before close. */
    allDevicesRequired: z.boolean(),
  }),
});

export type Template = z.infer<typeof templateSchema>;
export type Question = z.infer<typeof questionSchema>;
export type DeviceField = z.infer<typeof deviceFieldSchema>;
export type DeviceCheck = z.infer<typeof deviceCheckSchema>;

/**
 * Parse and check a template. Throws with a readable message if it is wrong.
 * Also checks things a schema cannot: keys must be unique, published
 * templates must name who approved them.
 */
export function parseTemplate(raw: unknown): Template {
  const result = templateSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Invalid template at ${issue?.path.join(".")}: ${issue?.message}`);
  }
  const t = result.data;
  const expectedId = `${t.discipline}-${t.province}-v${t.version}`;
  if (t.id !== expectedId) {
    throw new Error(`Template id "${t.id}" should be "${expectedId}"`);
  }
  assertUnique(
    t.questions.map((q) => q.key),
    "question",
  );
  assertUnique(
    t.deviceFields.map((f) => f.key),
    "device field",
  );
  assertUnique(
    t.deviceChecks.map((c) => c.key),
    "device check",
  );
  if (t.status === "published" && !t.approvedBy) {
    throw new Error(`Template ${t.id} is published but has no approvedBy`);
  }
  return t;
}

function assertUnique(keys: string[], what: string): void {
  const seen = new Set<string>();
  for (const k of keys) {
    if (seen.has(k)) throw new Error(`Duplicate ${what} key "${k}"`);
    seen.add(k);
  }
}

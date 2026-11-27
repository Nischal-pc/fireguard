import { z } from "zod";
import {
  ANSWER_VALUES,
  DEFICIENCY_STATUSES,
  DEVICE_RESULTS,
  INSPECTION_STATUSES,
  SEVERITIES,
} from "./enums";

/**
 * The shapes a tablet is allowed to upload.
 *
 * The tablet keeps a local queue of changes (PowerSync calls these CRUD
 * entries). When it has signal it sends them to POST /sync/upload in order.
 * The server checks every entry against these schemas before writing.
 *
 * Rule: only tables the technician owns can be uploaded. Work orders,
 * customers and sites come from Softrend and are read-only on the tablet.
 */

const id = z.string().uuid();
const isoTime = z.string().datetime({ offset: true });

export const inspectionRow = z.object({
  wo_discipline_id: id,
  template_id: z.string().min(1),
  status: z.enum(INSPECTION_STATUSES),
  tech_id: id,
  started_at: isoTime.nullable().optional(),
  completed_at: isoTime.nullable().optional(),
});

export const answerRow = z.object({
  inspection_id: id,
  question_key: z.string().min(1),
  value: z.enum(ANSWER_VALUES),
  note: z.string().max(2000).nullable().optional(),
  tech_id: id,
  answered_at: isoTime,
});

export const deviceResultRow = z.object({
  inspection_id: id,
  device_id: id,
  result: z.enum(DEVICE_RESULTS),
  /** Readings and checks for this device, keyed by the template's field keys. */
  readings: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .default({}),
  tech_id: id,
  tested_at: isoTime,
});

export const deficiencyRow = z.object({
  inspection_id: id,
  device_id: id.nullable().optional(),
  question_key: z.string().nullable().optional(),
  severity: z.enum(SEVERITIES),
  description: z.string().min(1).max(4000),
  quote_required: z.boolean(),
  status: z.enum(DEFICIENCY_STATUSES).default("open"),
});

export const photoRow = z.object({
  owner_table: z.enum(["device_results", "deficiencies", "answers", "work_orders"]),
  owner_id: id,
  storage_key: z.string().min(1),
  taken_at: isoTime,
});

/** Tables a tablet may write to, with the schema for each. */
export const UPLOADABLE_TABLES = {
  inspections: inspectionRow,
  answers: answerRow,
  device_results: deviceResultRow,
  deficiencies: deficiencyRow,
  photos: photoRow,
} as const;

export type UploadableTable = keyof typeof UPLOADABLE_TABLES;

/**
 * One queued change from the tablet.
 * PUT = create or replace the whole row; PATCH = change some columns; DELETE = soft delete.
 */
export const crudEntry = z.object({
  op: z.enum(["PUT", "PATCH", "DELETE"]),
  table: z.string(),
  id,
  data: z.record(z.string(), z.unknown()).optional(),
});
export type CrudEntry = z.infer<typeof crudEntry>;

export const syncUploadBatch = z.object({
  /** The tablet sending the batch, for logs and support. */
  client_id: z.string().min(1),
  entries: z.array(crudEntry).min(1).max(500),
});
export type SyncUploadBatch = z.infer<typeof syncUploadBatch>;

export type EntryCheck =
  | { ok: true; table: UploadableTable; data: Record<string, unknown> | null }
  | { ok: false; error: string };

/**
 * Check one entry: is the table allowed, and does the data have the right shape?
 * PATCH entries are checked against a partial version of the schema.
 */
export function checkEntry(entry: CrudEntry): EntryCheck {
  if (!(entry.table in UPLOADABLE_TABLES)) {
    return { ok: false, error: `Table "${entry.table}" cannot be written from a tablet` };
  }
  const table = entry.table as UploadableTable;
  if (entry.op === "DELETE") {
    return { ok: true, table, data: null };
  }
  const schema = UPLOADABLE_TABLES[table];
  const parsed =
    entry.op === "PATCH"
      ? schema.partial().safeParse(entry.data ?? {})
      : schema.safeParse(entry.data ?? {});
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join(".") || "(row)";
    return { ok: false, error: `${table}.${where}: ${first?.message ?? "invalid"}` };
  }
  return { ok: true, table, data: parsed.data as Record<string, unknown> };
}

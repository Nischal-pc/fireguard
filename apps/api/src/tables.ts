import { schema } from "@fireguard/db";
import type { UploadableTable } from "@fireguard/shared";

/** Drizzle table for each table a tablet may upload to. */
export const UPLOAD_TABLES = {
  inspections: schema.inspections,
  answers: schema.answers,
  device_results: schema.deviceResults,
  deficiencies: schema.deficiencies,
  photos: schema.photos,
} as const satisfies Record<UploadableTable, unknown>;

/**
 * Tablet rows use snake_case column names (SQLite on the device mirrors
 * Postgres). Drizzle uses camelCase property names. Timestamps arrive as ISO
 * strings and become Date objects.
 */
export function toColumns(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = key.endsWith("_at") && typeof value === "string" ? new Date(value) : value;
  }
  return out;
}

import { type Db, schema } from "@fireguard/db";
import { checkEntry, newId, type SyncUploadBatch } from "@fireguard/shared";
import { eq, sql } from "drizzle-orm";
import { evaluateStoredInspection } from "./close-check";
import { toColumns, UPLOAD_TABLES } from "./tables";

export interface UploadResult {
  applied: number;
  rejected: Array<{ id: string; error: string }>;
}

/**
 * Apply a batch of queued changes from one tablet, in order.
 *
 * - Each entry is checked against @fireguard/shared before it touches the database.
 * - Each entry runs in its own savepoint: one bad entry is rejected and reported,
 *   the rest still apply. The tablet logs rejected entries and drops them, so a
 *   single bad row can never block the whole queue.
 * - PUT is an upsert, so resending the same batch is harmless (idempotent).
 * - DELETE is a soft delete (sets deleted_at).
 * - Every applied change is written to audit_log.
 */
export async function applyUpload(
  db: Db,
  batch: SyncUploadBatch,
  userId: string,
): Promise<UploadResult> {
  const result: UploadResult = { applied: 0, rejected: [] };

  await db.transaction(async (tx) => {
    for (const entry of batch.entries) {
      const check = checkEntry(entry);
      if (!check.ok) {
        result.rejected.push({ id: entry.id, error: check.error });
        continue;
      }
      const table = UPLOAD_TABLES[check.table];
      try {
        await tx.transaction(async (sp) => {
          const now = new Date();
          if (entry.op === "DELETE") {
            await sp
              .update(table)
              .set({ deletedAt: now, updatedAt: now })
              .where(eq(table.id, entry.id));
          } else {
            const cols = toColumns(check.data ?? {});
            if (entry.op === "PUT") {
              await sp
                .insert(table)
                // biome-ignore lint/suspicious/noExplicitAny: columns were validated by checkEntry
                .values({ id: entry.id, ...cols } as any)
                .onConflictDoUpdate({
                  target: table.id,
                  // biome-ignore lint/suspicious/noExplicitAny: same as above
                  set: { ...cols, updatedAt: now, version: sql`${table.version} + 1` } as any,
                });
            } else {
              await sp
                .update(table)
                // biome-ignore lint/suspicious/noExplicitAny: same as above
                .set({ ...cols, updatedAt: now, version: sql`${table.version} + 1` } as any)
                .where(eq(table.id, entry.id));
            }

            // Closing an inspection: the server re-checks with the engine.
            if (check.table === "inspections" && check.data?.status === "completed") {
              const evaluation = await evaluateStoredInspection(sp as unknown as Db, entry.id);
              if (!evaluation.canClose) {
                const kinds = [...new Set(evaluation.blockers.map((b) => b.kind))].join(", ");
                throw new CloseRefused(
                  `Inspection cannot close: ${evaluation.blockers.length} blocker(s) (${kinds})`,
                );
              }
            }
          }
          await sp.insert(schema.auditLog).values({
            id: newId(),
            tableName: check.table,
            recordId: entry.id,
            op: entry.op,
            data: check.data,
            userId,
            clientId: batch.client_id,
          });
        });
        result.applied++;
      } catch (err) {
        result.rejected.push({ id: entry.id, error: describe(err) });
      }
    }
  });

  return result;
}

class CloseRefused extends Error {}

function describe(err: unknown): string {
  if (err instanceof CloseRefused) return err.message;
  // Database errors (for example a device id that does not exist) carry a short message.
  const cause = (err as { cause?: { message?: string } })?.cause?.message;
  const message = cause ?? (err instanceof Error ? err.message : String(err));
  return message.split("\n")[0] ?? "Unknown error";
}

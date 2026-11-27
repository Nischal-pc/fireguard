import { type Db, schema } from "@fireguard/db";
import { type Evaluation, evaluateInspection } from "@fireguard/engine";
import { getTemplate } from "@fireguard/templates";
import { and, eq, inArray, isNull } from "drizzle-orm";

const {
  inspections,
  woDisciplines,
  workOrders,
  devices,
  answers,
  deviceResults,
  deficiencies,
  photos,
} = schema;

/**
 * Before the server accepts "this inspection is completed", it re-runs the
 * same engine the tablet ran. If the tablet was out of date or buggy, the
 * server still refuses to close an incomplete inspection.
 */
export async function evaluateStoredInspection(db: Db, inspectionId: string): Promise<Evaluation> {
  const [row] = await db
    .select({
      templateId: inspections.templateId,
      discipline: woDisciplines.discipline,
      siteId: workOrders.siteId,
    })
    .from(inspections)
    .innerJoin(woDisciplines, eq(inspections.woDisciplineId, woDisciplines.id))
    .innerJoin(workOrders, eq(woDisciplines.workOrderId, workOrders.id))
    .where(eq(inspections.id, inspectionId));
  if (!row) throw new Error(`Inspection ${inspectionId} not found`);

  const template = getTemplate(row.templateId);

  const siteDevices = await db
    .select({ id: devices.id })
    .from(devices)
    .where(
      and(
        eq(devices.siteId, row.siteId),
        eq(devices.discipline, row.discipline),
        eq(devices.active, true),
        isNull(devices.deletedAt),
      ),
    );

  const answerRows = await db
    .select({ questionKey: answers.questionKey, value: answers.value })
    .from(answers)
    .where(and(eq(answers.inspectionId, inspectionId), isNull(answers.deletedAt)))
    .orderBy(answers.answeredAt);

  const resultRows = await db
    .select({
      id: deviceResults.id,
      deviceId: deviceResults.deviceId,
      result: deviceResults.result,
      readings: deviceResults.readings,
    })
    .from(deviceResults)
    .where(and(eq(deviceResults.inspectionId, inspectionId), isNull(deviceResults.deletedAt)));

  const resultIds = resultRows.map((r) => r.id);
  const photoRows =
    resultIds.length === 0
      ? []
      : await db
          .select({ ownerId: photos.ownerId })
          .from(photos)
          .where(
            and(
              eq(photos.ownerTable, "device_results"),
              inArray(photos.ownerId, resultIds),
              isNull(photos.deletedAt),
            ),
          );
  const photoCount = new Map<string, number>();
  for (const p of photoRows) photoCount.set(p.ownerId, (photoCount.get(p.ownerId) ?? 0) + 1);

  const defRows = await db
    .select({ deviceId: deficiencies.deviceId, questionKey: deficiencies.questionKey })
    .from(deficiencies)
    .where(and(eq(deficiencies.inspectionId, inspectionId), isNull(deficiencies.deletedAt)));

  return evaluateInspection({
    template,
    deviceIds: siteDevices.map((d) => d.id),
    answers: answerRows,
    deviceResults: resultRows.map((r) => ({
      deviceId: r.deviceId,
      result: r.result,
      photoCount: photoCount.get(r.id) ?? 0,
      note: typeof r.readings.note === "string" ? r.readings.note : null,
    })),
    deficiencyFor: {
      questionKeys: defRows.flatMap((d) => (d.questionKey ? [d.questionKey] : [])),
      deviceIds: defRows.flatMap((d) => (d.deviceId ? [d.deviceId] : [])),
    },
  });
}

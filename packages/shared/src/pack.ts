import { z } from "zod";

/**
 * The parts of GET /work-orders/:softrendWo/pack that the tablet reads.
 * Loose objects keep fields the tablet does not read yet instead of stripping them.
 */
export const jobPackSchema = z.object({
  workOrder: z.looseObject({
    softrendWo: z.string(),
    scheduledAt: z.string(),
    coordinatorNote: z.string().nullable(),
  }),
  // Optional so the app can say "Site details missing" instead of a generic error.
  site: z
    .looseObject({
      name: z.string(),
      address: z.string().nullable(),
      city: z.string().nullable(),
      accessNotes: z.string().nullable(),
    })
    .nullish(),
  disciplines: z.array(
    z.object({
      woDiscipline: z.looseObject({ id: z.string(), discipline: z.string() }),
      template: z.looseObject({ id: z.string() }),
      devices: z.array(
        z.looseObject({
          id: z.string(),
          seq: z.number(),
          barcode: z.string().nullable(),
          location: z.string().nullable(),
          attributes: z.record(z.string(), z.unknown()),
        }),
      ),
      progress: z.looseObject({ percentComplete: z.number() }),
    }),
  ),
});

export type JobPackResponse = z.infer<typeof jobPackSchema>;

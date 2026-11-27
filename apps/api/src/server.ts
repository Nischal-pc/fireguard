import { type Db, schema } from "@fireguard/db";
import { evaluateInspection } from "@fireguard/engine";
import { isId, syncUploadBatch } from "@fireguard/shared";
import { getTemplate } from "@fireguard/templates";
import { and, asc, eq, isNull } from "drizzle-orm";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { applyUpload } from "./sync-upload";

export interface ServerOptions {
  db: Db;
  logger?: boolean;
}

/**
 * Builds the API. Kept separate from main.ts so tests can create a server
 * against an in-memory database and call it without opening a port.
 */
export function buildServer({ db, logger = false }: ServerOptions): FastifyInstance {
  const app = Fastify({ logger, bodyLimit: 5 * 1024 * 1024 });

  app.get("/health", async () => ({ ok: true, time: new Date().toISOString() }));

  /**
   * Everything a tablet needs for one job: header, site, disciplines, each
   * discipline's template and device list. PowerSync replaces this for
   * day-to-day sync in P1; it stays useful for the portal and for debugging.
   */
  app.get<{ Params: { softrendWo: string } }>(
    "/work-orders/:softrendWo/pack",
    async (req, reply) => {
      requireUser(req);
      const [wo] = await db
        .select()
        .from(schema.workOrders)
        .where(eq(schema.workOrders.softrendWo, req.params.softrendWo));
      if (!wo) return reply.code(404).send({ error: "Work order not found" });

      const [site] = await db.select().from(schema.sites).where(eq(schema.sites.id, wo.siteId));
      const disciplines = await db
        .select()
        .from(schema.woDisciplines)
        .where(eq(schema.woDisciplines.workOrderId, wo.id));

      const packs = [];
      for (const d of disciplines) {
        const template = getTemplate(d.templateId);
        const deviceRows = await db
          .select()
          .from(schema.devices)
          .where(
            and(
              eq(schema.devices.siteId, wo.siteId),
              eq(schema.devices.discipline, d.discipline),
              eq(schema.devices.active, true),
              isNull(schema.devices.deletedAt),
            ),
          )
          .orderBy(asc(schema.devices.seq));
        const progress = evaluateInspection({
          template,
          deviceIds: deviceRows.map((x) => x.id),
          answers: [],
          deviceResults: [],
        });
        packs.push({ woDiscipline: d, template, devices: deviceRows, progress });
      }
      return { workOrder: wo, site, disciplines: packs };
    },
  );

  /** Queued changes from a tablet. See sync-upload.ts for the rules. */
  app.post("/sync/upload", async (req, reply) => {
    const userId = requireUser(req);
    const parsed = syncUploadBatch.safeParse(req.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid batch", issues: parsed.error.issues.slice(0, 5) });
    }
    const result = await applyUpload(db, parsed.data, userId);
    if (result.rejected.length > 0) {
      req.log.warn(
        { rejected: result.rejected, client: parsed.data.client_id },
        "sync entries rejected",
      );
    }
    return result;
  });

  return app;
}

/**
 * TEMPORARY development sign-in: the caller sends its user id in the
 * x-user-id header. Replace with Microsoft Entra ID token checks in P1
 * (see docs/specs/p1-walking-skeleton.md, task 7). Never deploy this to production.
 */
function requireUser(req: FastifyRequest): string {
  const id = req.headers["x-user-id"];
  if (typeof id !== "string" || !isId(id)) {
    const err = new Error("Sign-in required") as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }
  return id;
}

import type { Evaluation, Template } from "@fireguard/engine";

/** The parts of GET /work-orders/:softrendWo/pack this screen reads (apps/api/src/server.ts). */
export interface JobPack {
  workOrder: {
    softrendWo: string;
    scheduledAt: string;
    coordinatorNote: string | null;
  };
  site: { name: string; address: string | null; city: string | null; accessNotes: string | null };
  disciplines: Array<{
    woDiscipline: { id: string; discipline: string; templateId: string };
    template: Template;
    devices: Array<{
      id: string;
      seq: number;
      barcode: string | null;
      location: string | null;
      attributes: Record<string, unknown>;
    }>;
    progress: Evaluation;
  }>;
}

export type PackResult = { ok: true; pack: JobPack } | { ok: false; error: string };

const TIMEOUT_MS = 10_000;

/**
 * Online-only job pack load for P1 task 2. Task 4 replaces this with local
 * SQLite, so a tap never waits on the network.
 */
export async function fetchPack(
  baseUrl: string,
  userId: string,
  softrendWo: string,
): Promise<PackResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res: Response;
    try {
      res = await fetch(
        `${baseUrl.replace(/\/+$/, "")}/work-orders/${encodeURIComponent(softrendWo)}/pack`,
        { headers: { "x-user-id": userId }, signal: controller.signal },
      );
    } catch {
      return { ok: false, error: "Can't reach server. Check Wi-Fi and the API address." };
    }
    if (res.status === 404) return { ok: false, error: "Work order not found" };
    if (res.status === 401) return { ok: false, error: "Sign-in required" };
    const serverError = {
      ok: false,
      error: `Server answered with an error (status ${res.status})`,
    } as const;
    if (!res.ok) return serverError;
    let pack: JobPack;
    try {
      pack = (await res.json()) as JobPack;
    } catch {
      // A captive portal or the wrong port can answer 200 with HTML.
      return serverError;
    }
    // The API does not yet refuse a work order whose site row is missing.
    if (!pack.site) return { ok: false, error: "Site details missing" };
    return { ok: true, pack };
  } finally {
    clearTimeout(timer);
  }
}

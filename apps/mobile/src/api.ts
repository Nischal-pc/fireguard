import { type JobPackResponse, jobPackSchema } from "@fireguard/shared";

/** The job pack the screen shows, once the site is known to be there. */
export type JobPack = Omit<JobPackResponse, "site"> & {
  site: NonNullable<JobPackResponse["site"]>;
};

export type PackResult = { ok: true; pack: JobPack } | { ok: false; error: string };

const TIMEOUT_MS = 10_000;

/**
 * Online-only job pack load for P1.2. P1.4 replaces this with local
 * SQLite, so a tap never waits on the network. Never throws.
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
    if (res.status === 404) return { ok: false, error: `Work order ${softrendWo} not found` };
    if (res.status === 401) return { ok: false, error: "Sign-in required" };
    if (!res.ok)
      return { ok: false, error: `Server answered with an error (status ${res.status})` };
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // A captive portal or the wrong port can answer 200 with HTML.
      return {
        ok: false,
        error: "Got a page that isn't FireGuard. Check the Wi-Fi login and the API address.",
      };
    }
    const parsed = jobPackSchema.safeParse(body);
    if (!parsed.success) return { ok: false, error: "Server sent a job this app can't read" };
    const { site, ...rest } = parsed.data;
    // The API does not yet refuse a work order whose site row is missing.
    if (!site) return { ok: false, error: "Site details missing" };
    return { ok: true, pack: { ...rest, site } };
  } finally {
    clearTimeout(timer);
  }
}

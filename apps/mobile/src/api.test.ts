import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPack } from "./api";

const userId = "43c3ee92-33a0-44bc-b239-ddbae0465d90";

const discipline = {
  woDiscipline: { id: "wd-1", discipline: "FE", templateId: "fe-sk-v1" },
  template: { id: "fe-sk-v1", questions: [] },
  devices: [
    { id: "d-1", seq: 1, barcode: null, location: "Lobby", attributes: { size_type: "5 lb ABC" } },
  ],
  progress: { percentComplete: 0, canClose: false },
};
const validPack = {
  workOrder: {
    softrendWo: "SAMPLE-0001",
    scheduledAt: "2026-12-01T15:00:00Z",
    coordinatorNote: null,
  },
  site: { name: "Sample Site", address: "1 Main St", city: "Regina", accessNotes: null },
  disciplines: [discipline],
};

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchPack", () => {
  it("requests /work-orders/:wo/pack with the x-user-id header", async () => {
    const fn = mockFetch(async () => Response.json({}));
    await fetchPack("http://192.168.1.20:3000/", userId, "SAMPLE-0001");
    const [url, init] = fn.mock.calls[0] ?? [];
    expect(url).toBe("http://192.168.1.20:3000/work-orders/SAMPLE-0001/pack");
    expect(init?.headers).toEqual({ "x-user-id": userId });
  });

  it("returns the pack on 200, keeping fields the screen does not read", async () => {
    mockFetch(async () => Response.json(validPack));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({
      ok: true,
      pack: validPack,
    });
  });

  it('reports "Site details missing" when the pack has no site', async () => {
    const { site: _site, ...noSite } = validPack;
    mockFetch(async () => Response.json(noSite));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({
      ok: false,
      error: "Site details missing",
    });
  });

  it.each([
    ["a null body", null],
    ["a body with no disciplines", { ...validPack, disciplines: undefined }],
    ["a device with no id", { ...validPack, disciplines: [{ ...discipline, devices: [{}] }] }],
  ])("reports an unreadable job, without throwing, for %s", async (_name, body) => {
    mockFetch(async () => Response.json(body));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({
      ok: false,
      error: "Server sent a job this app can't read",
    });
  });

  it('reports "not found" with the work order number on 404', async () => {
    mockFetch(async () => new Response(null, { status: 404 }));
    expect(await fetchPack("http://api", userId, "NOPE")).toEqual({
      ok: false,
      error: "Work order NOPE not found",
    });
  });

  it("reports a server error with its status on 5xx", async () => {
    mockFetch(async () => new Response("boom", { status: 503 }));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({
      ok: false,
      error: "Server answered with an error (status 503)",
    });
  });

  it("says the page is not FireGuard when 200 is not JSON (captive portal)", async () => {
    mockFetch(async () => new Response("<html>Wi-Fi login</html>", { status: 200 }));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({
      ok: false,
      error: "Got a page that isn't FireGuard. Check the Wi-Fi login and the API address.",
    });
  });

  it('reports "sign-in required" on 401', async () => {
    mockFetch(async () => new Response(null, { status: 401 }));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({
      ok: false,
      error: "Sign-in required",
    });
  });

  it("reports can't reach server on a network error", async () => {
    mockFetch(async () => {
      throw new TypeError("Network request failed");
    });
    const result = await fetchPack("http://api", userId, "SAMPLE-0001");
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/Can't reach server/);
  });

  it("gives up after the timeout instead of hanging", async () => {
    vi.useFakeTimers();
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))),
        ),
    );
    const pending = fetchPack("http://api", userId, "SAMPLE-0001");
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(!result.ok && result.error).toMatch(/Can't reach server/);
  });
});

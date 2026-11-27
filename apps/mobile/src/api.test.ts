import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPack } from "./api";

const userId = "43c3ee92-33a0-44bc-b239-ddbae0465d90";

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

  it("returns the pack on 200", async () => {
    const pack = { workOrder: { softrendWo: "SAMPLE-0001" }, site: {}, disciplines: [] };
    mockFetch(async () => Response.json(pack));
    expect(await fetchPack("http://api", userId, "SAMPLE-0001")).toEqual({ ok: true, pack });
  });

  it('reports "not found" on 404', async () => {
    mockFetch(async () => new Response(null, { status: 404 }));
    expect(await fetchPack("http://api", userId, "NOPE")).toEqual({
      ok: false,
      error: "Work order NOPE not found",
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

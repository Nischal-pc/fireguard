import type { JobPack, PackResult } from "./api";

/** What the job screen shows. Kept pure so it can be tested without rendering. */
export type PackState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; pack: JobPack };

export type PackEvent = { type: "load" } | { type: "loaded"; result: PackResult };

export const initialPackState: PackState = { kind: "loading" };

export function packReducer(_state: PackState, event: PackEvent): PackState {
  if (event.type === "load") return { kind: "loading" };
  return event.result.ok
    ? { kind: "ready", pack: event.result.pack }
    : { kind: "error", message: event.result.error };
}

export interface Settings {
  apiUrl: string | undefined;
  userId: string | undefined;
  workOrder: string | undefined;
}

export const MISSING_SETTINGS =
  "Missing settings. Create apps/mobile/.env from .env.example, then restart Expo.";

/** All three EXPO_PUBLIC_* values must be set before the app can ask the API. */
export function checkSettings(
  s: Settings,
): { ok: true; apiUrl: string; userId: string; workOrder: string } | { ok: false; error: string } {
  if (!s.apiUrl || !s.userId || !s.workOrder) return { ok: false, error: MISSING_SETTINGS };
  return { ok: true, apiUrl: s.apiUrl, userId: s.userId, workOrder: s.workOrder };
}

/** One list of every device across the job's disciplines, in pack order. */
export function allDevices(pack: JobPack) {
  return pack.disciplines.flatMap((d) => d.devices);
}

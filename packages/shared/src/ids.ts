import { uuidv7 } from "uuidv7";

/**
 * Every record gets its id on the device that creates it, so a tablet can
 * create answers, results and photos with no signal. UUID v7 ids sort by
 * creation time, which keeps database indexes efficient.
 */
export function newId(): string {
  return uuidv7();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isId(value: string): boolean {
  return UUID_RE.test(value);
}

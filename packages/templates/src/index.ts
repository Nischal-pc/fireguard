import { parseTemplate, type Template } from "@fireguard/engine";
import type { Discipline, Province } from "@fireguard/shared";
import feSkV1 from "./fe-sk-v1.json";

/**
 * Every template the platform knows. Add a new JSON file and list it here.
 * Templates are parsed (checked) when this module loads, so a broken template
 * fails the tests and CI before it can reach a tablet.
 */
const RAW_TEMPLATES: unknown[] = [feSkV1];

export const TEMPLATES: Template[] = RAW_TEMPLATES.map(parseTemplate);

export function getTemplate(id: string): Template {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown template "${id}"`);
  return t;
}

/** The newest template for a discipline and province, or undefined if none exists. */
export function latestTemplate(
  discipline: Discipline,
  province: Province,
  opts: { includeDrafts: boolean },
): Template | undefined {
  return TEMPLATES.filter(
    (t) =>
      t.discipline === discipline &&
      t.province === province &&
      (opts.includeDrafts || t.status === "published"),
  ).sort((a, b) => b.version - a.version)[0];
}

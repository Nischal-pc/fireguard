#!/usr/bin/env node
/**
 * PostToolUse hook for Edit and Write: formats the file Claude just changed with
 * Biome and applies safe lint fixes. If lint errors remain, exit code 2 shows
 * them to Claude so it fixes them straight away instead of at commit time.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname, isAbsolute, resolve } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
// biome-ignore lint/suspicious/noUndeclaredEnvVars: Claude Code sets this for every hook
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const abs = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
const formatted = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".jsonc",
  ".css",
]);
if (!formatted.has(extname(abs)) || !existsSync(abs)) process.exit(0);

const biome = resolve(projectDir, "node_modules/@biomejs/biome/bin/biome");
if (!existsSync(biome)) process.exit(0); // dependencies not installed yet

const result = spawnSync(
  process.execPath,
  [biome, "check", "--write", "--no-errors-on-unmatched", abs],
  { cwd: projectDir, encoding: "utf8" },
);

if (result.status !== 0) {
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`
    .trim()
    .split("\n")
    .slice(0, 40)
    .join("\n");
  process.stderr.write(
    `Biome found problems in ${filePath} that it could not fix automatically:\n${output}\n`,
  );
  process.exit(2);
}
process.exit(0);

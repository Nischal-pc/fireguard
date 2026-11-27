#!/usr/bin/env node
/**
 * PreToolUse hook for Edit and Write: blocks changes that break FireGuard's rules.
 * Exit code 2 blocks the edit; the message on stderr goes back to Claude so it
 * can choose the right way instead.
 *
 * Blocked:
 *  1. Committed database migrations (packages/db/drizzle/**). Change schema.ts and
 *     run `pnpm db:generate` instead. A new, uncommitted migration may still be edited.
 *  2. Published inspection templates. Create a new version instead.
 *  3. Secrets: .env files.
 *  4. pnpm-lock.yaml. Let pnpm write it.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
// biome-ignore lint/suspicious/noUndeclaredEnvVars: Claude Code sets this for every hook
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const abs = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
const rel = relative(projectDir, abs).split(sep).join("/");

function block(reason) {
  process.stderr.write(`Blocked by .claude/hooks/protect-files.mjs: ${reason}\n`);
  process.exit(2);
}

function isCommitted(path) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path], {
      cwd: projectDir,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

// 1. Committed migrations
if (rel.startsWith("packages/db/drizzle/") && isCommitted(rel)) {
  block(
    `${rel} is a committed migration and must never change. Edit packages/db/src/schema.ts, then run "pnpm db:generate" to create a new migration.`,
  );
}

// 2. Published templates
if (/^packages\/templates\/src\/.+\.json$/.test(rel) && existsSync(abs)) {
  try {
    const current = JSON.parse(readFileSync(abs, "utf8"));
    if (current.status === "published") {
      block(
        `${rel} is a published template (${current.id}). Published templates never change: copy it to a new version file (version + 1, status "draft") and register it in packages/templates/src/index.ts.`,
      );
    }
  } catch {
    // Not valid JSON yet: let the edit through; tests will catch it.
  }
}

// 3. Secrets
const base = rel.split("/").pop() ?? "";
if (base === ".env" || (base.startsWith(".env.") && base !== ".env.example")) {
  block(`${rel} holds secrets. Edit .env.example instead and tell the user which value to set.`);
}

// 4. Lockfile
if (rel === "pnpm-lock.yaml") {
  block("pnpm-lock.yaml is written by pnpm. Use pnpm add / pnpm install instead of editing it.");
}

process.exit(0);

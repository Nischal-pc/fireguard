# 0006 — Inspection templates as versioned JSON in the repository

Date: 2026-11-26 · Status: accepted for Stage 1

## Decision

Templates live in `packages/templates/src/*.json`, one file per
discipline + province + version (for example `FE-SK-v1`). They are validated
by `parseTemplate()` when the package loads, so a broken template fails CI.

## Rules

- A template starts as `draft` and becomes `published` only after a senior
  technician signs off (`approvedBy`).
- A published template never changes. A fix is a new version.
- An inspection records the template id it started on and finishes on it.

## Later

When coordinators need to edit wording themselves (portal template admin),
move templates into a database table with the same schema and rules.

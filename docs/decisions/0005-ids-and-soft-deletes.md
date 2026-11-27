# 0005 — Ids made on the device; soft deletes only

Date: 2026-11-26 · Status: accepted

## Decision

- Every row's id is a UUID v7 created by whoever creates the row (usually the
  tablet), using `newId()` from `@fireguard/shared`.
- Rows are never deleted; `deleted_at` is set instead.

## Why

- A tablet with no signal must create answers, results and photos without
  asking the server for an id.
- UUID v7 sorts by time, which keeps Postgres indexes efficient.
- Soft deletes mean a late sync can never lose or resurrect data, and the
  audit trail stays complete. Inspection reports are legal records.

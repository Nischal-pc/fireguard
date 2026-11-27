# 0002 — Offline sync with PowerSync, uploads through our API

Date: 2026-11-26 · Status: accepted (to be proven by the P1 walking skeleton)

## Context

Technicians work in basements and rural sites with no signal. The current
Softrend app freezes because it waits on the network. Writing a correct sync
engine from scratch takes months and is the riskiest code in the system.

## Decision

- Tablets keep a local SQLite database through the PowerSync React Native SDK.
- Downloads: the PowerSync service streams rows from Postgres (logical
  replication) to each tablet according to sync rules (only that technician's
  jobs, sites, devices and templates).
- Uploads: the SDK queues local changes and our app sends them to
  `POST /sync/upload` on our API, which validates them with
  `@fireguard/shared` and `@fireguard/engine` before writing.
- Self-host the PowerSync Open Edition in Docker locally and in our Canadian
  cloud region, so data stays in Canada and there is no per-seat sync fee.

## Consequences

- Postgres must run with `wal_level=logical` (already set in docker-compose).
- Our API, not PowerSync, decides what is allowed to be written.
- If the walking skeleton shows PowerSync does not fit, the fallback is a
  custom outbox: a local `outbox` table on the tablet plus pull/push endpoints.
  The upload endpoint is already shaped to support either.

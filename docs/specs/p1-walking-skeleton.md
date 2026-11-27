# Feature: Walking skeleton (offline inspection, end to end)

Phase: P1 Discipline(s): FE Owner: <you> Status: approved

## Job story

When I am in a building with no signal, I want to open today's job, answer the
building questions and mark every extinguisher, so that the result reaches the
office automatically when I get signal, and nothing I recorded is ever lost.

## What it proves

The hardest idea in the platform, offline + sync, works end to end before we
build anything wide. It is deliberately ugly: one job, one discipline, plain
screens.

## Scope

- Tablet: sign in, see today's job, open the FE inspection, answer the 6
  building questions (Yes / No / N/A), mark each device pass or fail, see
  progress from the engine, close the inspection.
- Everything works in airplane mode. Changes upload when signal returns.
- Server: PowerSync streams the job to the tablet; `/sync/upload` accepts
  changes; the server refuses to close an incomplete inspection.
- Portal: one page listing today's jobs with % complete.

## Out of scope

Photos, deficiencies, signatures, PDF, barcode, design polish, other
disciplines, Softrend Bridge (we use the seeded sample site).

## Tasks (in order — one pull request each)

1. Run the starter locally (database, migrations, seed, API).
2. Create `apps/mobile` with Expo; show the job pack from the API (online only).
3. Add PowerSync locally: service in docker-compose, sync rules, dev token
   endpoint on the API.
4. Tablet local database: PowerSync schema, connector (`uploadData` sends to
   `/sync/upload`), today's job read from local SQLite.
5. Inspection screens: questions, device list (FlashList), pass/fail, progress
   from `@fireguard/engine`, close button enabled only when `canClose`.
6. Airplane-mode test: whole sample inspection offline, reconnect, verify in
   Postgres and `audit_log`.
7. Real sign-in with Microsoft Entra ID; API verifies tokens; remove the
   `x-user-id` stand-in.
8. Create `apps/portal` with Next.js: today's jobs with % complete.
9. Staging: API, Postgres and PowerSync in the Canadian cloud region; app build
   on the test tablet pointing at staging.
10. Soak test: 1,000-device site, full day offline, measure tap time.

## Done when

- [ ] A full FE inspection of the sample site is completed in airplane mode
- [ ] After reconnecting, every answer and result is in Postgres with an audit row
- [ ] Closing with an untested device is refused on the tablet and on the server
- [ ] Marking a device updates the screen in under 50 ms on the test tablet
- [ ] The 1,000-device list scrolls smoothly
- [ ] The senior reviewer has reviewed the sync design
- [ ] `pnpm check` passes in CI

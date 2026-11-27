# Phase P2: Engine + extinguishers, end to end

Phase: P2   Discipline(s): FE   Owner: <you>   Status: outline
(Run `/fg-spec refine docs/specs/p2-extinguishers.md` before P2.4.
P2.1–P2.3 are detailed enough to start once the P0 and P1 gates have passed.)

## Goal
A technician completes a real annual extinguisher inspection on a real
customer site, start to finish, on the tablet, signed in, with photos,
deficiencies and a customer signature, and the result is on a staging server
the coordinator can see.

## Job stories
- When I arrive at a site with 40 extinguishers, I want to scan each tag and
  mark it in seconds, so that I spend my time on the failures.
- When an extinguisher fails, I want to take a photo and record a deficiency
  in one flow, so that the office can quote the repair without calling me.
- When I find an extinguisher that is not on the list, I want to add it on the
  spot, so that next year's list is right.

## Tasks (one pull request each)

- **P2.1** Real sign-in: Microsoft Entra ID on the tablet (PKCE, session kept
  for offline use) and the portal; API verifies tokens on every route; map
  Entra users to `users` by email; remove the `x-user-id` stand-in.
- **P2.2** Portal "today" page: `GET /work-orders?date=&branch=` with each
  job's disciplines and `percentComplete` from the engine; page lists today's
  jobs by technician, refreshes every 30 s.
- **P2.3** Staging: managed Postgres (logical replication), API and PowerSync
  as containers, secrets manager, infrastructure as code in `infra/`, deploy on
  merge to `main`, `docs/runbooks/staging.md`. Cost estimate approved first.
- **P2.4** Softrend Bridge, read side: `apps/bridge` reads work orders,
  customers, sites, equipment and attachments by the access method Softrend
  confirmed (see architecture), posts them to `POST /bridge/import`; idempotent
  upserts keyed on `softrend_*` ids. **Blocked until Softrend answers.**
- **P2.5** Device registry import: turn Softrend equipment rows into `devices`
  with FE identity attributes; report of rows that could not be mapped.
- **P2.6** Barcode/QR scan: scan a tag to jump to the device, show its last 3
  results; unknown code offers "add new device".
- **P2.7** Photos: capture, shrink to about 300 KB on the tablet, store
  locally, upload in the background to object storage via signed URL
  (`POST /files/upload-url`), `photos` row synced; photo required on fail.
- **P2.8** Deficiencies: create from a "No" answer or a failed device with the
  template's suggested description and severity; edit, attach photos.
- **P2.9** Device changes on site: add a device found on site, mark one
  removed (soft delete), edit identity fields (size, serial, due years).
- **P2.10** Speed tools: "copy from last inspection", "pass all remaining in
  this area" with a confirm step.
- **P2.11** Close the job: customer signature on glass, name and time, job
  summary screen, inspection locked after close.
- **P2.12** Crash and performance reporting: Sentry in app and API; on-screen
  tap-time readout in debug builds.

## Data
New tables or columns are expected for P2.6 (last results lookup), P2.7
(`photos.uploaded_at` use), P2.9 (device added-on-site flag), P2.11
(`signatures` sync). Use `/fg-db` for each.

## Out of scope
PDF reports (P3), other disciplines (P3, P6), write-back to Softrend (P7).

## Done when (P2 gate)
- [ ] Champion technician completes at least 3 real FE jobs on staging in
      parallel with Softrend, and the results match
- [ ] Every failed device has a photo and a deficiency
- [ ] Sign-in works offline for a full day after signing in once (the full
  7 days in `docs/architecture.md` is checked at the P4 gate)
- [ ] Coordinator sees the jobs and progress in the portal
- [ ] All performance budgets in `docs/architecture.md` that apply are met
- [ ] `pnpm check` green; reviewers' verdicts recorded in each PR

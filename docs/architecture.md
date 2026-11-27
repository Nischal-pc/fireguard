# FireGuard Pro — architecture

The target system. Decisions that change any of this need a decision record
in `docs/decisions/`.

## Components

```text
 On premises                Cloud (Canadian region)                    Field and office
 ───────────                ───────────────────────                    ────────────────
 Softrend Foundation 3000   API (Fastify)  ──  PostgreSQL              Technician tablet
        │                        │              │ logical replication   (Expo app, SQLite,
 Softrend Bridge  ── HTTPS ──►   │           PowerSync service ──────►  PowerSync SDK)
 (Windows VM, outbound only)     │                                          │
                                 ├── Object storage (photos, PDFs)          │ uploads via
                                 ├── Worker (PDF builds, emails,  ◄──────────┘ POST /sync/upload
                                 │   Softrend pushes, queue)
                                 └── Coordinator portal (Next.js)  ◄──── browser
```

| Component | Repo path | Status |
| --- | --- | --- |
| Shared rules (enums, ids, upload schemas) | `packages/shared` | Built |
| Inspection engine | `packages/engine` | Built (core) |
| Templates | `packages/templates` | FE-SK-v1 draft |
| Database schema + migrations | `packages/db` | Built (19 tables) |
| API | `apps/api` | Built (pack, sync upload, close check) |
| Technician app | `apps/mobile` | P1 |
| Coordinator portal | `apps/portal` | P2 onward |
| PowerSync service + sync rules | `infra/powersync` (P1 task 3) | P1 |
| Worker | `apps/worker` | P3 |
| Softrend Bridge | `apps/bridge` | P2 (read), P7 (write-back) |
| Cloud infrastructure as code | `infra/` | P2 (staging), P4 (production) |

## Data ownership

Each field has exactly one owner, so systems never fight over a value.

| Data | Owner | Direction |
| --- | --- | --- |
| Customers, sites, billing, contacts | Softrend until Stage 3, then platform | Softrend → platform |
| Work order header, schedule, assigned techs, disciplines | Softrend until Stage 2, then platform | Softrend → platform |
| Coordinator attachments | Portal (or Softrend) | Into platform, pre-downloaded to tablets |
| Device registry per site | Platform (seeded once from Softrend) | Platform |
| Inspections, answers, device results, photos, signatures | Platform | Stays; PDF pushed to Softrend |
| Hours, parts used, deficiencies, quote requests | Platform | Platform → Softrend on job close |

## Softrend integration (Bridge)

Options, in order of preference; which one we use depends on Softrend's
written answer (open question):

- **A. Softrend API or web service**, if one exists and covers what we need.
- **B. Read-only SQL views + staging tables** that a Softrend import job loads.
- **C. Scheduled file exchange** (CSV/XML) as the fallback.

Rules: poll for changed work orders every 2–5 minutes; a started work order is
locked against header changes (queued, shown to the tech as a banner); every
write-back carries an idempotency key (`softrend_outbox.idempotency_key`);
failed pushes retry and alert after 30 minutes.

## Sync rules

1. Each tablet downloads only its technician's work orders for the next 3 days,
   with their sites, devices, templates and attachments.
2. Uploads go through `POST /sync/upload`; they are idempotent.
3. The server re-checks every upload with `@fireguard/shared` and
   `@fireguard/engine`; closing an inspection is re-evaluated on the server.
4. No two people own the same field; shared jobs split devices by zone.
5. Nothing is hard-deleted; every change writes `audit_log`.

## Performance budgets (checked before every release)

| Action | Budget |
| --- | --- |
| Answer a question or mark a device | under 50 ms to the screen updating |
| Open a work order (1,000 devices) | under 300 ms |
| Scroll a 1,000-device list | 60 fps, no stalls |
| Photo taken → back on the form | under 1 s (upload later) |
| Cold start → today's schedule | under 2 s |
| Download a full day (4 jobs + attachments) on LTE | under 60 s |
| Fully offline operation | 7 days, no data loss |
| Crash-free sessions | 99.8% or better |

## Security and compliance

- Data hosted in Canada; encrypted in transit and at rest (server and tablet).
- Microsoft Entra ID sign-in with MFA; roles: technician, coordinator,
  branch manager, admin; branch-scoped access.
- Audit trail on every answer: tech, time, template version, before/after.
- Signed reports are frozen; corrections create a new revision.
- Lost tablet: remote wipe through MDM.
- Templates follow the standard and edition each province has adopted;
  a senior technician signs off every template before it is published.

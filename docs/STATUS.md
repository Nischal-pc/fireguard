# FireGuard Pro — status

Single source of truth for progress. Read it at the start of every session
(`/fg-next`). Updated **inside feature branches**: `/fg-start` marks a task
`in progress`, `/fg-ship` marks it `done` in the same pull request, so `main`
always shows what has actually been merged. Gates are marked passed only by
`/fg-gate`, with the user's confirmation.

Statuses: `todo` · `in progress` · `done` · `blocked (reason)` · `skipped (reason)`

**Current phase:** P1 Walking skeleton
**Last updated:** 2026-11-26

## P0 Foundations

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P0.1 | Tools installed (Node 22, pnpm 10, Git, Docker, VS Code, Claude Code) | done | |
| P0.2 | Starter repo on GitHub, CI green, branch protection on `main` | done | Nischal-pc/fireguard; first CI run green; `main` needs PR + `check` |
| P0.3 | Claude Code setup (.claude folder, plugins, Context7) | in progress | .claude + fg- skills in place; Context7 added to .mcp.json, approve it on next `claude` start |
| P0.4 | Management: protected build hours, champion technician and coordinator | todo | |
| P0.5 | Freeze log running with all technicians | todo | |
| P0.6 | Softrend integration questions sent; written answer received | todo | blocks P2.4 |
| P0.7 | Ride-alongs (3) and coordinator shadowing (2) | todo | |
| P0.8 | FE-SK-v1 wording reviewed by a senior technician | todo | template still `draft`, no `approvedBy` |
| P0.9 | First Expo cloud build installed on the test tablet | todo | no `eas.json` yet; app runs in Expo Go |

**P0 gate:** test app on a tablet from CI; Softrend access method known — not passed
P1 may run in parallel with the open P0 items. The P0 gate must pass before P2 starts.

## P1 Walking skeleton — `docs/specs/p1-walking-skeleton.md` (approved)

| ID | Task | Status | Branch / PR | Notes |
| --- | --- | --- | --- | --- |
| P1.1 | Run the starter locally | done | p1/task-2-job-screen | shipped in the P1.2 pull request |
| P1.2 | Mobile app shows the job pack (online) | done | p1/task-2-job-screen | pack validated with jobPackSchema (shared); white-on-fire contrast still open |
| P1.3 | PowerSync running locally | todo | | |
| P1.4 | Tablet local database + upload connector | todo | | needs Expo development build |
| P1.5a | Inspection: building questions | todo | | |
| P1.5b | Inspection: device list and pass/fail | todo | | |
| P1.5c | Inspection: progress and blockers from the engine | todo | | |
| P1.5d | Inspection: close when complete | todo | | |
| P1.6 | Airplane-mode test + Maestro flow | todo | | |
| P1.10 | Soak test, 1,000 devices, full day offline | todo | | |

**P1 gate:** not passed

## P2 Engine + extinguishers — `docs/specs/p2-extinguishers.md` (outline)

| ID | Task | Status | Branch / PR | Notes |
| --- | --- | --- | --- | --- |
| P2.1 | Real sign-in (Entra ID) | todo | | needs Entra app registration |
| P2.2 | Portal "today" page | todo | | |
| P2.3 | Staging environment | todo | | needs cloud account |
| P2.4 | Softrend Bridge, read side | blocked (P0.6) | | |
| P2.5 | Device registry import | todo | | |
| P2.6 | Barcode / QR scan | todo | | |
| P2.7 | Photos with background upload | todo | | |
| P2.8 | Deficiencies | todo | | |
| P2.9 | Device changes on site | todo | | |
| P2.10 | Copy from last inspection, pass-all with confirm | todo | | |
| P2.11 | Signature and job close | todo | | |
| P2.12 | Sentry and tap-time readout | todo | | |

**P2 gate:** not passed

## Later phases

Task lists are in each spec; rows are added here when the phase's spec is
refined and approved.

| Phase | Spec | Spec status | Gate |
| --- | --- | --- | --- |
| P3 Lighting, exits, reports | `p3-lighting-exits-reports.md` | outline | not passed |
| P4 Hardening | `p4-hardening.md` | outline | not passed |
| P5 Pilot | `p5-pilot.md` | outline | not passed |
| P6 Fire alarm | `p6-fire-alarm.md` | outline | not passed |
| P7 Write-back + rollout | `p7-writeback-rollout.md` | outline | not passed |
| S2 Dispatch | `s2-dispatch.md` | outline | not passed |
| S3 Back office | `s3-back-office.md` | outline | not passed |

## Open questions

- Does Foundation 3000 expose an API, database views, or only file exchange? (P0.6)
- Report retention period required by insurers and each province.
- Which branch pilots, and which 3 technicians.
- Which tablets the technicians will carry (iPad or Android).

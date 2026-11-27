# FireGuard Pro — roadmap

The order of work from the starter to the finished product. Progress is
tracked in `docs/STATUS.md`. Each phase has a spec in `docs/specs/` and ends at
a **gate**: a test that must pass before the next phase starts (`/fg-gate`).

## How specs mature (rolling-wave planning)

- **approved**: detailed enough to build; `/fg-start` may start its tasks.
- **outline**: goal, tasks and gate are agreed, details are not. Before the
  first task of an outline phase, run `/fg-spec refine <spec file>` and get
  it approved. Plans made months ahead are always wrong in the details; we fill
  them in with what we learned.

## Stage 1 — Field platform (replaces the Softrend Service app)

| Phase | Months | Spec | Goal | Gate |
| --- | --- | --- | --- | --- |
| P0 Foundations | 1 | (setup guide) | Tools, repo, CI, accounts, field research | Test app on a tablet from CI; Softrend access method known |
| P1 Walking skeleton | 2 (to week 10) | `p1-walking-skeleton.md` (approved) | Prove offline + sync end to end on one ugly screen | Full FE inspection offline, synced with audit rows, close refused when incomplete, taps < 50 ms, 1,000-device scroll smooth, sync reviewed |
| P2 Engine + extinguishers | 3–4 | `p2-extinguishers.md` (outline) | One complete discipline, end to end, with real sign-in and staging | Champion completes real FE jobs in parallel with Softrend; results match |
| P3 Lighting, exits, reports | 5 | `p3-lighting-exits-reports.md` (outline) | Three disciplines on one job and a customer-ready PDF | Coordinator champion signs off the PDF for each province |
| P4 Hardening | 6 | `p4-hardening.md` (outline) | Safe for real customers | Reviewer sign-off; every performance budget passes on the slowest tablet |
| P5 Pilot | 7–8 | `p5-pilot.md` (outline) | Prove it in one branch | 4 weeks, zero lost inspections; techs say it is faster |
| P6 Fire alarm | 7–9 | `p6-fire-alarm.md` (outline) | The biggest, slowest reports | Full FA annual in the pilot branch with no freeze |
| P7 Write-back + rollout | 9–10 | `p7-writeback-rollout.md` (outline) | Close the loop with Softrend and go wide | **Softrend Service app retired** |

## Stage 2 — Dispatch (months 11–14)

`s2-dispatch.md` (outline). Gate: **coordinators stop scheduling in Softrend.**

## Stage 3 — Back office (months 15–20)

`s3-back-office.md` (outline). Gate: **Softrend licence ended.**

## Task IDs

Every task has an ID: phase + number (`P2.4`, `S2.1`). The list of tasks for a
phase lives in its spec; their status lives in `docs/STATUS.md`. Bugs are
GitHub issues, fixed on `fix/<issue>-<name>` branches.

## Outside dependencies (track in STATUS.md)

| Needed by | Dependency | Owner |
| --- | --- | --- |
| P2.4 | Softrend's written answer on API / database / file access | You + management |
| P2.1 | Microsoft Entra ID app registration | Company IT |
| P2.3 | Cloud account with billing alert, Canadian region | You + management |
| P3, P6 | Template wording signed off by a senior technician per province | Senior techs |
| P4 | External security and sync review | Senior reviewer |
| P4 | Tablets purchased and enrolled in MDM | Management |
| P5 | Pilot branch and 3 technicians chosen | Management |
| S3 | Accounting product chosen with the accountant | Management |

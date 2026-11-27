# Phase P7: Write-back to Softrend and rollout

Phase: P7   Owner: <you>   Status: outline
(Run `/fg-spec refine docs/specs/p7-writeback-rollout.md` first.)

## Goal
Finished jobs flow back into Softrend for billing without anyone retyping
them, and all 8 branches move to the new platform.

## Tasks
- **P7.1** Write-back via `softrend_outbox` and the Bridge: hours, parts used,
  deficiencies (as quote requests), finished PDF attached to the work order;
  idempotency keys; retry and alert after 30 minutes.
- **P7.2** Time and parts capture on the tablet (`time_entries`, `parts_used`)
  if not already built.
- **P7.3** Branch onboarding runbook: data export, import script, cleanup
  report, spot-check of 10 sites, training session.
- **P7.4** Rollout waves: 2 branches every 2 weeks; Softrend Service app stays
  installed but unused for 30 days per branch.
- **P7.5** Retire the Softrend Service app.

## Done when (P7 gate)
- [ ] One month of jobs written back to Softrend with no retyping and no
      duplicates
- [ ] All 8 branches live for 30 days
- [ ] **Softrend Service app removed from every tablet**

---
name: fg-gate
description: Gate review at the end of a phase, for example "/fg-gate P1". Checks every exit criterion in the phase's spec against evidence, asks the user to confirm the checks only a person can make, writes a gate report, and marks the gate passed in docs/STATUS.md only if everything is met.
argument-hint: "[phase, e.g. P1]"
disable-model-invocation: true
---

Gate review for: $ARGUMENTS

A gate is the only way into the next phase. Be strict: a criterion without
evidence is not met.

1. Read the phase's spec in `docs/specs/` ("Done when" list), its row in
   `docs/roadmap.md`, and its section in `docs/STATUS.md`.
2. Check that every task of the phase is `done` or explicitly `skipped` with a
   reason. List any that are not.
3. For each criterion, find evidence and say where it is:
   - automated: run `pnpm check`, the relevant tests, `gh run list` for CI;
   - documents: runbook results, test write-ups in `docs/runbooks/`,
     reviewer verdicts in merged pull requests (`gh pr list --state merged`);
   - human-only checks (tablet tests, champion sign-offs, reviewer sign-off):
     ask the user one question per criterion and wait for the answers.
4. Create a branch `gate/<phase>` and write `docs/gates/<phase>.md`:
   date, each criterion with **Met** or **Not met** and its evidence, open
   risks carried into the next phase, and lessons that should change the next
   phase's spec.
5. If every criterion is met **and the user confirms**, update
   `docs/STATUS.md`: mark the gate passed with the date, set "Current phase"
   to the next phase, and add the next phase's task rows from its spec. Then
   tell the user to run `/fg-spec refine <next spec>` if that spec is still
   an outline.
6. If anything is not met, do not mark the gate. List exactly what is missing
   and which task or person closes each gap.
7. Commit, then suggest `/fg-ship` to open the pull request for the gate report.

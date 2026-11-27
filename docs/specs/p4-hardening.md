# Phase P4: Hardening

Phase: P4   Owner: <you>   Status: outline
(Run `/fg-spec refine docs/specs/p4-hardening.md` first.)

## Goal
Safe for real customers and real data: measured performance, reviewed
security, tested backups, alerts, managed tablets, trained people.

## Tasks
- **P4.1** Performance budgets in CI: Maestro flows on the slowest supported
  tablet (or emulator profile) with timing checks for every budget in
  `docs/architecture.md`; nightly run; a failed budget blocks release.
- **P4.2** Security review: external reviewer's checklist (auth, roles and
  branch scoping, sync rules, secrets, dependency scan, tablet encryption);
  fix every finding.
- **P4.3** Backups: daily automated, 35-day retention; monthly restore test to
  staging; `docs/runbooks/restore.md`.
- **P4.4** Monitoring and alerts: Sentry release health, API and Bridge uptime
  checks, stuck-sync and stuck-Softrend-push alerts to your phone.
- **P4.5** Production environment as code (same as staging, separate
  account or project), deploy by hand after staging sign-off.
- **P4.6** Tablet fleet: MDM enrollment, app distribution, passcode policy,
  remote wipe tested.
- **P4.7** Release process: versioning, release notes in plain words,
  over-the-air update rules (what may ship OTA, what needs a store build).
- **P4.8** Training: 1-page quick card, 2-hour hands-on session plan,
  `docs/runbooks/onboard-technician.md`.
- **P4.9** Pilot data: import and clean the pilot branch's sites and devices.

## Done when (P4 gate)
- [ ] Reviewer signs off security and sync
- [ ] Every performance budget passes on the slowest tablet
- [ ] A restore from backup has been done and timed
- [ ] Alerts reach your phone in a test
- [ ] Pilot tablets enrolled; pilot branch data imported and spot-checked

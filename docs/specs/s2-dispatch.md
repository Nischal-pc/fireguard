# Stage 2: Dispatch (scheduling moves to the portal)

Stage: S2   Owner: <you>   Status: outline
(Re-plan at the P7 gate with `/fg-spec refine docs/specs/s2-dispatch.md`.)

## Goal
Coordinators schedule and dispatch all work in the portal; the Bridge reverses
direction and sends new work orders to Softrend only so billing keeps working.

## Tasks
- **S2.1** Calendar by branch and technician: day and week views.
- **S2.2** Drag-and-drop dispatch; conflicts and travel time shown.
- **S2.3** Recurring inspections generated from device due dates and
  contract frequency (annual, semi-annual, monthly).
- **S2.4** Technician availability, certifications per discipline, and
  qualification checks when assigning.
- **S2.5** Customer confirmations and reminders by email.
- **S2.6** Bridge reverse direction: work orders created in the portal are
  sent to Softrend for billing; ownership of the work order header moves to
  the platform (update `docs/architecture.md` and a decision record).

## Done when (S2 gate)
- [ ] One full month scheduled only in the portal at every branch
- [ ] **Coordinators stop scheduling in Softrend**

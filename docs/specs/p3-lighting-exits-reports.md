# Phase P3: Emergency lighting, exit signs, and reports

Phase: P3   Discipline(s): EL, EX (+ FE in AB, BC)   Owner: <you>   Status: outline
(Run `/fg-spec refine docs/specs/p3-lighting-exits-reports.md` first.)

## Goal
One work order can carry FE, EL and EX together; the technician moves between
them in one job hub; the office gets a customer-ready PDF per discipline,
in the layout each province expects.

## Tasks
- **P3.1** EL template for SK via `/fg-template EL SK new`: unit or remote
  head, lamp count, battery type, start and end voltage, test duration in
  minutes. Wording from the senior technician.
- **P3.2** EX template for SK: sign type, battery backup, lit on AC and on
  battery.
- **P3.3** FE, EL, EX templates for AB and BC (wording and standard edition
  from senior technicians in each province).
- **P3.4** Job hub: all disciplines on the work order with their own progress;
  locked discipline if the technician is not certified (flag to coordinator).
- **P3.5** Readings input: numeric keypad fields, units, sensible ranges from
  the template, voltage drop calculated by the engine.
- **P3.6** Worker + PDF reports: `apps/worker`, queue, HTML report layouts in
  `packages/report`, rendered to PDF after the inspection syncs; one report per
  discipline; province layouts.
- **P3.7** Portal v1: live board by branch, attach files to a job (reach the
  tablet on next sync), report review (send back to tech with a comment),
  send PDF to the customer by email.
- **P3.8** Attachments on the tablet: view coordinator PDFs and drawings
  offline.

## Done when (P3 gate)
- [ ] A job with FE + EL + EX is completed offline and synced
- [ ] Coordinator champion signs off the PDF layout for SK, AB and BC
- [ ] A report sent back with a comment reaches the tablet and returns fixed
- [ ] Senior technicians signed off every template used

# Phase P6: Fire alarm

Phase: P6   Discipline: FA   Owner: <you>   Status: outline
(Run `/fg-spec refine docs/specs/p6-fire-alarm.md` first. This is the
largest phase; expect the refined spec to split it further.)

## Goal
A full fire alarm annual inspection, including sites with 1,000+ devices and
several technicians, completed on tablets with no freeze, producing a report
in the CAN/ULC-S536 form order for the edition each province has adopted.

## Tasks
- **P6.1** FA data model via `/fg-db`: control units (panels), loops or
  zones, device addresses, device types (smoke, heat, pull station,
  horn/strobe, module, duct detector...), relationships to devices.
- **P6.2** FA templates per province and S536 edition via `/fg-template`:
  control unit record, annunciators, power supplies, device records; wording
  from senior technicians.
- **P6.3** Device testing at scale: filter by panel, zone or floor; scan;
  "pass all remaining in this zone" with confirm; quick-fail reasons.
- **P6.4** Batteries: load test results and calculations by the engine (the
  standard is moving from voltage readings to load testing; follow the
  province's edition).
- **P6.5** Multi-technician jobs: split zones between technicians
  (`work_order_techs.zone`), each tablet sees the whole site but writes only
  its zones; merged progress in the portal.
- **P6.6** FA report: PDF in the S536 form order; panel and device sections.

## Done when (P6 gate)
- [ ] A full FA annual done in the pilot branch with no freeze
- [ ] A 1,000-device site meets every performance budget
- [ ] Two technicians on one site finish without conflicts
- [ ] Senior technicians signed off the FA templates and report

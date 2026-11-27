# FireGuard Pro — product brief

Read this before any planning work. It is the "why" behind every spec.

## The problem

A fire protection company with **8 branches**, **13 coordinators** and **15
technicians** in **Saskatchewan, Alberta and British Columbia** runs on
Softrend Foundation 3000. Its mobile "Service" app freezes while technicians
fill in fire alarm (FA), fire extinguisher (FE), emergency lighting (EL) and
exit sign (EX) reports, especially on big sites, in basements and in rural
areas with weak signal. Freezes cost re-entry time, risk lost inspection data,
and delay reports the office needs to invoice.

## What we are building

| Part | Who uses it | What it does |
| --- | --- | --- |
| Technician app (tablet) | 15 technicians | Offline-first inspections for any mix of FA, FE, EL, EX on one work order |
| Coordinator portal (web) | 13 coordinators, branch managers | Live progress, attach documents to jobs, review and send reports; later, scheduling |
| API + sync | Both | Moves data between tablets and the office safely, re-checks every rule |
| Softrend Bridge | Behind the scenes | Copies work orders in from Softrend and results back, until Softrend is retired |

## The rule above all others

**The tablet is the source of truth during an inspection; the network is only
a background courier.** A technician never waits on the network.

## How Softrend is replaced (three stages)

1. **Stage 1 — Field platform (months 1–10):** the technician app and portal
   replace the Softrend Service app. Softrend still schedules and invoices.
2. **Stage 2 — Dispatch (months 11–14):** coordinators schedule in the portal.
3. **Stage 3 — Back office (months 15–20):** customers, sites and quotes move
   to the platform; invoicing goes to a **bought** accounting product;
   Softrend is switched off.

## Not building, ever

Accounting, tax, payroll, general ledger. These are bought.

## How we know it works

- Zero lost inspections.
- No screen waits on the network; a tap updates the screen in under 50 ms.
- A 1,000-device fire alarm site scrolls smoothly.
- Technicians say an inspection takes less time than in Softrend.
- Reports are accepted by customers and authorities having jurisdiction
  without rework.

## Constraints

- Inspection reports are legal records: full audit trail, nothing hard-deleted.
- Standards differ by province and edition (CAN/ULC-S536 for fire alarm,
  National Fire Code Section 6.5 for emergency lighting, provincial fire codes
  for extinguishers and exits). Templates are versioned per province.
- Data stays in Canada.
- One builder plus Claude, about 25–30 hours a week, with a part-time senior
  reviewer for sync, integration and security.

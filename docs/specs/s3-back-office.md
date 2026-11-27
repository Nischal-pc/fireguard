# Stage 3: Back office (Softrend switched off)

Stage: S3   Owner: <you>   Status: outline
(Re-plan at the S2 gate with `/fg-spec refine docs/specs/s3-back-office.md`.)

## Goal
Customers, sites and quotes live in the platform; invoices go to a bought
accounting product; Softrend is archived read-only and its licence ended.

## Rule
Never build accounting, tax, payroll or a general ledger. The platform sends
invoice data to the accounting product and nothing more.

## Tasks
- **S3.1** Decision record: accounting product chosen with the accountant
  (Canadian tax, multi-province, has an API).
- **S3.2** Customers and sites mastered in the platform; ownership moves from
  Softrend (decision record; update `docs/architecture.md`).
- **S3.3** Quotes built from deficiencies: line items, approval by the
  customer, converted into repair work orders.
- **S3.4** Invoice push to the accounting product: from completed work
  orders, hours and parts; idempotent; reconciliation report.
- **S3.5** Light parts inventory per van and branch.
- **S3.6** Softrend archive: full database export and all PDF reports kept
  read-only for the retention period required by insurers and provinces.
- **S3.7** Parallel month: invoices built in both systems and compared line
  by line before switch-off.

## Done when (S3 gate)
- [ ] One month of invoices match between Softrend and the new path
- [ ] Year-end close done in the accounting product
- [ ] **Softrend licence ended**

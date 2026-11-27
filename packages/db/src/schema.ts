import {
  ANSWER_VALUES,
  DEFICIENCY_STATUSES,
  DEVICE_RESULTS,
  DISCIPLINES,
  INSPECTION_STATUSES,
  PROVINCES,
  ROLES,
  SEVERITIES,
  WORK_ORDER_STATUSES,
} from "@fireguard/shared";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * FireGuard database schema.
 *
 * Conventions (see CLAUDE.md):
 * - ids are UUID v7, created on the device that creates the row
 * - every table has created_at, updated_at, deleted_at (soft delete) and version
 * - never hard-delete; never edit a migration that has been applied
 * - columns copied from Softrend carry a softrend_* id so the Bridge can match them
 */

// ---------- enums (values come from @fireguard/shared) ----------
export const disciplineEnum = pgEnum("discipline", DISCIPLINES);
export const provinceEnum = pgEnum("province", PROVINCES);
export const roleEnum = pgEnum("role", ROLES);
export const workOrderStatusEnum = pgEnum("work_order_status", WORK_ORDER_STATUSES);
export const inspectionStatusEnum = pgEnum("inspection_status", INSPECTION_STATUSES);
export const answerValueEnum = pgEnum("answer_value", ANSWER_VALUES);
export const deviceResultEnum = pgEnum("device_result", DEVICE_RESULTS);
export const severityEnum = pgEnum("severity", SEVERITIES);
export const deficiencyStatusEnum = pgEnum("deficiency_status", DEFICIENCY_STATUSES);
export const outboxStatusEnum = pgEnum("outbox_status", ["pending", "sent", "failed"]);

// ---------- shared columns ----------
const base = {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  version: integer("version").notNull().default(1),
};

// ---------- people and places ----------
export const branches = pgTable("branches", {
  ...base,
  name: text("name").notNull(),
  province: provinceEnum("province").notNull(),
});

export const users = pgTable(
  "users",
  {
    ...base,
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: roleEnum("role").notNull(),
    branchId: uuid("branch_id").references(() => branches.id),
    /** Disciplines this person is certified to inspect, e.g. ["FE","EL","EX"]. */
    certifications: jsonb("certifications").$type<string[]>().notNull().default([]),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const customers = pgTable(
  "customers",
  {
    ...base,
    softrendId: text("softrend_id"),
    name: text("name").notNull(),
    billingContact: text("billing_contact"),
    billingEmail: text("billing_email"),
    billingPhone: text("billing_phone"),
  },
  (t) => [uniqueIndex("customers_softrend_uq").on(t.softrendId)],
);

export const sites = pgTable(
  "sites",
  {
    ...base,
    softrendId: text("softrend_id"),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    name: text("name").notNull(),
    address: text("address"),
    city: text("city"),
    province: provinceEnum("province").notNull(),
    accessNotes: text("access_notes"),
  },
  (t) => [
    uniqueIndex("sites_softrend_uq").on(t.softrendId),
    index("sites_customer_idx").on(t.customerId),
  ],
);

// ---------- work ----------
export const workOrders = pgTable(
  "work_orders",
  {
    ...base,
    softrendWo: text("softrend_wo").notNull(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    branchId: uuid("branch_id").references(() => branches.id),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    estHours: numeric("est_hours", { precision: 5, scale: 2 }),
    status: workOrderStatusEnum("status").notNull().default("scheduled"),
    coordinatorNote: text("coordinator_note"),
  },
  (t) => [
    uniqueIndex("work_orders_softrend_uq").on(t.softrendWo),
    index("work_orders_scheduled_idx").on(t.scheduledAt),
  ],
);

export const workOrderTechs = pgTable(
  "work_order_techs",
  {
    workOrderId: uuid("work_order_id")
      .notNull()
      .references(() => workOrders.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    /** Optional zone when several techs split a big site. */
    zone: text("zone"),
  },
  (t) => [primaryKey({ columns: [t.workOrderId, t.userId] })],
);

/** Which inspections this visit needs (FA, FE, EL, EX, in any mix). */
export const woDisciplines = pgTable(
  "wo_disciplines",
  {
    ...base,
    workOrderId: uuid("work_order_id")
      .notNull()
      .references(() => workOrders.id),
    discipline: disciplineEnum("discipline").notNull(),
    /** Template id from @fireguard/templates, e.g. "FE-SK-v1". Fixed once the inspection starts. */
    templateId: text("template_id").notNull(),
  },
  (t) => [uniqueIndex("wo_disciplines_uq").on(t.workOrderId, t.discipline)],
);

// ---------- assets ----------
export const devices = pgTable(
  "devices",
  {
    ...base,
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id),
    discipline: disciplineEnum("discipline").notNull(),
    barcode: text("barcode"),
    location: text("location").notNull(),
    /** Sequence number on the site's device list (the "Seq" sort). */
    seq: integer("seq"),
    /** Identity fields from the template's deviceFields (size, make, serial, due years...). */
    attributes: jsonb("attributes").$type<Record<string, unknown>>().notNull().default({}),
    active: boolean("active").notNull().default(true),
  },
  (t) => [
    index("devices_site_idx").on(t.siteId, t.discipline),
    index("devices_barcode_idx").on(t.barcode),
  ],
);

// ---------- results (written from tablets) ----------
export const inspections = pgTable(
  "inspections",
  {
    ...base,
    woDisciplineId: uuid("wo_discipline_id")
      .notNull()
      .references(() => woDisciplines.id),
    templateId: text("template_id").notNull(),
    status: inspectionStatusEnum("status").notNull().default("not_started"),
    techId: uuid("tech_id")
      .notNull()
      .references(() => users.id),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("inspections_wod_idx").on(t.woDisciplineId)],
);

export const answers = pgTable(
  "answers",
  {
    ...base,
    inspectionId: uuid("inspection_id")
      .notNull()
      .references(() => inspections.id),
    questionKey: text("question_key").notNull(),
    value: answerValueEnum("value").notNull(),
    note: text("note"),
    techId: uuid("tech_id")
      .notNull()
      .references(() => users.id),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("answers_inspection_idx").on(t.inspectionId)],
);

export const deviceResults = pgTable(
  "device_results",
  {
    ...base,
    inspectionId: uuid("inspection_id")
      .notNull()
      .references(() => inspections.id),
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id),
    result: deviceResultEnum("result").notNull(),
    readings: jsonb("readings").$type<Record<string, unknown>>().notNull().default({}),
    techId: uuid("tech_id")
      .notNull()
      .references(() => users.id),
    testedAt: timestamp("tested_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("device_results_inspection_idx").on(t.inspectionId),
    uniqueIndex("device_results_one_per_device_uq")
      .on(t.inspectionId, t.deviceId)
      .where(sql`deleted_at is null`),
  ],
);

export const deficiencies = pgTable(
  "deficiencies",
  {
    ...base,
    inspectionId: uuid("inspection_id")
      .notNull()
      .references(() => inspections.id),
    deviceId: uuid("device_id").references(() => devices.id),
    questionKey: text("question_key"),
    severity: severityEnum("severity").notNull(),
    description: text("description").notNull(),
    quoteRequired: boolean("quote_required").notNull().default(true),
    status: deficiencyStatusEnum("status").notNull().default("open"),
  },
  (t) => [index("deficiencies_inspection_idx").on(t.inspectionId)],
);

/** Photos live in object storage; this row points at the file. */
export const photos = pgTable(
  "photos",
  {
    ...base,
    ownerTable: text("owner_table").notNull(),
    ownerId: uuid("owner_id").notNull(),
    storageKey: text("storage_key").notNull(),
    takenAt: timestamp("taken_at", { withTimezone: true }).notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
  },
  (t) => [index("photos_owner_idx").on(t.ownerTable, t.ownerId)],
);

export const attachments = pgTable("attachments", {
  ...base,
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  fileName: text("file_name").notNull(),
  storageKey: text("storage_key").notNull(),
  /** "softrend" if copied by the Bridge, "portal" if a coordinator added it. */
  source: text("source").notNull(),
});

export const signatures = pgTable("signatures", {
  ...base,
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  signerName: text("signer_name").notNull(),
  storageKey: text("storage_key").notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true }).notNull(),
});

export const timeEntries = pgTable("time_entries", {
  ...base,
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  minutes: integer("minutes").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
});

export const partsUsed = pgTable("parts_used", {
  ...base,
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  partNo: text("part_no").notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(),
});

// ---------- integration and audit ----------
/** Everything waiting to be written into Softrend by the Bridge. */
export const softrendOutbox = pgTable(
  "softrend_outbox",
  {
    ...base,
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    /** e.g. "wo:73647:FE:v3". The Bridge never writes the same key twice. */
    idempotencyKey: text("idempotency_key").notNull(),
    status: outboxStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
  },
  (t) => [uniqueIndex("softrend_outbox_key_uq").on(t.idempotencyKey)],
);

/** Every change to a technician-owned row, kept forever. Inspection reports are legal records. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id").notNull(),
    op: text("op").notNull(),
    data: jsonb("data").$type<Record<string, unknown> | null>(),
    userId: uuid("user_id"),
    clientId: text("client_id"),
  },
  (t) => [index("audit_log_record_idx").on(t.tableName, t.recordId)],
);

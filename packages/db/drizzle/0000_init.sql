CREATE TYPE "public"."answer_value" AS ENUM('yes', 'no', 'na');--> statement-breakpoint
CREATE TYPE "public"."deficiency_status" AS ENUM('open', 'quoted', 'repaired', 'closed');--> statement-breakpoint
CREATE TYPE "public"."device_result" AS ENUM('pass', 'fail', 'not_tested');--> statement-breakpoint
CREATE TYPE "public"."discipline" AS ENUM('FA', 'FE', 'EL', 'EX');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."outbox_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."province" AS ENUM('SK', 'AB', 'BC');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('technician', 'coordinator', 'branch_manager', 'admin');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('life_safety', 'code_violation', 'cosmetic');--> statement-breakpoint
CREATE TYPE "public"."work_order_status" AS ENUM('scheduled', 'confirmed', 'on_site', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"inspection_id" uuid NOT NULL,
	"question_key" text NOT NULL,
	"value" "answer_value" NOT NULL,
	"note" text,
	"tech_id" uuid NOT NULL,
	"answered_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"work_order_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"storage_key" text NOT NULL,
	"source" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"op" text NOT NULL,
	"data" jsonb,
	"user_id" uuid,
	"client_id" text
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"province" "province" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"softrend_id" text,
	"name" text NOT NULL,
	"billing_contact" text,
	"billing_email" text,
	"billing_phone" text
);
--> statement-breakpoint
CREATE TABLE "deficiencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"inspection_id" uuid NOT NULL,
	"device_id" uuid,
	"question_key" text,
	"severity" "severity" NOT NULL,
	"description" text NOT NULL,
	"quote_required" boolean DEFAULT true NOT NULL,
	"status" "deficiency_status" DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_results" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"inspection_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"result" "device_result" NOT NULL,
	"readings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tech_id" uuid NOT NULL,
	"tested_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"site_id" uuid NOT NULL,
	"discipline" "discipline" NOT NULL,
	"barcode" text,
	"location" text NOT NULL,
	"seq" integer,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"wo_discipline_id" uuid NOT NULL,
	"template_id" text NOT NULL,
	"status" "inspection_status" DEFAULT 'not_started' NOT NULL,
	"tech_id" uuid NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "parts_used" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"work_order_id" uuid NOT NULL,
	"part_no" text NOT NULL,
	"qty" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"owner_table" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"taken_at" timestamp with time zone NOT NULL,
	"uploaded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"work_order_id" uuid NOT NULL,
	"signer_name" text NOT NULL,
	"storage_key" text NOT NULL,
	"signed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"softrend_id" text,
	"customer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"province" "province" NOT NULL,
	"access_notes" text
);
--> statement-breakpoint
CREATE TABLE "softrend_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "outbox_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"work_order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"minutes" integer NOT NULL,
	"started_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	"branch_id" uuid,
	"certifications" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wo_disciplines" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"work_order_id" uuid NOT NULL,
	"discipline" "discipline" NOT NULL,
	"template_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_order_techs" (
	"work_order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"zone" text,
	CONSTRAINT "work_order_techs_work_order_id_user_id_pk" PRIMARY KEY("work_order_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"softrend_wo" text NOT NULL,
	"site_id" uuid NOT NULL,
	"branch_id" uuid,
	"scheduled_at" timestamp with time zone NOT NULL,
	"est_hours" numeric(5, 2),
	"status" "work_order_status" DEFAULT 'scheduled' NOT NULL,
	"coordinator_note" text
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_tech_id_users_id_fk" FOREIGN KEY ("tech_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deficiencies" ADD CONSTRAINT "deficiencies_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deficiencies" ADD CONSTRAINT "deficiencies_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_results" ADD CONSTRAINT "device_results_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_results" ADD CONSTRAINT "device_results_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_results" ADD CONSTRAINT "device_results_tech_id_users_id_fk" FOREIGN KEY ("tech_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_wo_discipline_id_wo_disciplines_id_fk" FOREIGN KEY ("wo_discipline_id") REFERENCES "public"."wo_disciplines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_tech_id_users_id_fk" FOREIGN KEY ("tech_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_used" ADD CONSTRAINT "parts_used_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wo_disciplines" ADD CONSTRAINT "wo_disciplines_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_techs" ADD CONSTRAINT "work_order_techs_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_techs" ADD CONSTRAINT "work_order_techs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answers_inspection_idx" ON "answers" USING btree ("inspection_id");--> statement-breakpoint
CREATE INDEX "audit_log_record_idx" ON "audit_log" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_softrend_uq" ON "customers" USING btree ("softrend_id");--> statement-breakpoint
CREATE INDEX "deficiencies_inspection_idx" ON "deficiencies" USING btree ("inspection_id");--> statement-breakpoint
CREATE INDEX "device_results_inspection_idx" ON "device_results" USING btree ("inspection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "device_results_one_per_device_uq" ON "device_results" USING btree ("inspection_id","device_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "devices_site_idx" ON "devices" USING btree ("site_id","discipline");--> statement-breakpoint
CREATE INDEX "devices_barcode_idx" ON "devices" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "inspections_wod_idx" ON "inspections" USING btree ("wo_discipline_id");--> statement-breakpoint
CREATE INDEX "photos_owner_idx" ON "photos" USING btree ("owner_table","owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sites_softrend_uq" ON "sites" USING btree ("softrend_id");--> statement-breakpoint
CREATE INDEX "sites_customer_idx" ON "sites" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "softrend_outbox_key_uq" ON "softrend_outbox" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "wo_disciplines_uq" ON "wo_disciplines" USING btree ("work_order_id","discipline");--> statement-breakpoint
CREATE UNIQUE INDEX "work_orders_softrend_uq" ON "work_orders" USING btree ("softrend_wo");--> statement-breakpoint
CREATE INDEX "work_orders_scheduled_idx" ON "work_orders" USING btree ("scheduled_at");
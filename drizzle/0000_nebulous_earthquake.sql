CREATE TYPE "public"."audit_result" AS ENUM('approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."audit_status" AS ENUM('assigned', 'in_review', 'completed');--> statement-breakpoint
CREATE TYPE "public"."cert_status" AS ENUM('none', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('in_progress', 'submitted', 'settled', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."dataset_status" AS ENUM('draft', 'uploading', 'ready', 'public', 'archived');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'closed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."txn_type" AS ENUM('lock', 'reward', 'audit_fee', 'refund', 'platform_fee');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'institution', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"dataset_case_id" uuid NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"dataset_case_id" uuid NOT NULL,
	"result" "audit_result" NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"expert_id" text NOT NULL,
	"status" "audit_status" DEFAULT 'assigned' NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dataset_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"file_id" uuid,
	"case_id" varchar(100) NOT NULL,
	"storage_key" text NOT NULL,
	"thumbnail_key" text,
	"modality" varchar(50),
	"order_index" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'ready' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dataset_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"upload_session_id" uuid,
	"original_filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"size_bytes" bigint,
	"content_type" varchar(100),
	"checksum" varchar(128),
	"status" varchar(32) DEFAULT 'uploaded' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dataset_upload_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"dataset_id" uuid,
	"attestation_accepted" boolean DEFAULT false NOT NULL,
	"attestation_accepted_at" timestamp,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"modality" varchar(50) NOT NULL,
	"status" "dataset_status" DEFAULT 'draft' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "task_cases" (
	"task_id" uuid NOT NULL,
	"dataset_case_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"completed_cases" integer DEFAULT 0 NOT NULL,
	"status" "claim_status" DEFAULT 'in_progress' NOT NULL,
	"submitted_at" timestamp,
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_id" text NOT NULL,
	"dataset_id" uuid NOT NULL,
	"reward_per_case" bigint NOT NULL,
	"total_cases" integer NOT NULL,
	"max_claims" integer NOT NULL,
	"claimed_count" integer DEFAULT 0 NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"locked_amount" bigint NOT NULL,
	"status" "task_status" DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"name" varchar(100) NOT NULL,
	"institution" varchar(200),
	"specialty" varchar(100),
	"cert_status" "cert_status" DEFAULT 'none' NOT NULL,
	"cert_license_key" text,
	"cert_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_txns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"type" "txn_type" NOT NULL,
	"ref_type" varchar(50),
	"ref_id" uuid,
	"idempotency_key" varchar(160) NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_claim_id_task_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."task_claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_dataset_case_id_dataset_cases_id_fk" FOREIGN KEY ("dataset_case_id") REFERENCES "public"."dataset_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_dataset_case_id_dataset_cases_id_fk" FOREIGN KEY ("dataset_case_id") REFERENCES "public"."dataset_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_claim_id_task_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."task_claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_expert_id_user_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_cases" ADD CONSTRAINT "dataset_cases_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_cases" ADD CONSTRAINT "dataset_cases_file_id_dataset_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."dataset_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_files" ADD CONSTRAINT "dataset_files_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_files" ADD CONSTRAINT "dataset_files_upload_session_id_dataset_upload_sessions_id_fk" FOREIGN KEY ("upload_session_id") REFERENCES "public"."dataset_upload_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_upload_sessions" ADD CONSTRAINT "dataset_upload_sessions_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_cases" ADD CONSTRAINT "task_cases_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_cases" ADD CONSTRAINT "task_cases_dataset_case_id_dataset_cases_id_fk" FOREIGN KEY ("dataset_case_id") REFERENCES "public"."dataset_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_claims" ADD CONSTRAINT "task_claims_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_claims" ADD CONSTRAINT "task_claims_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_publisher_id_user_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_txns" ADD CONSTRAINT "wallet_txns_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "annotations_claim_case" ON "annotations" USING btree ("claim_id","dataset_case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_results_audit_case_unique" ON "audit_results" USING btree ("audit_id","dataset_case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dataset_cases_dataset_case_unique" ON "dataset_cases" USING btree ("dataset_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_cases_unique" ON "task_cases" USING btree ("task_id","dataset_case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_claims_unique" ON "task_claims" USING btree ("task_id","user_id");--> statement-breakpoint
CREATE INDEX "wallet_txns_user_idx" ON "wallet_txns" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_txns_idempotency_unique" ON "wallet_txns" USING btree ("idempotency_key");
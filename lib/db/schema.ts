import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

// Better Auth canonical tables. Auth/account/session ownership stays here;
// platform profile data is deliberately separated in user_profiles below.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const userRoleEnum = pgEnum("user_role", ["user", "institution", "admin"])
export const certStatusEnum = pgEnum("cert_status", ["none", "pending", "approved", "rejected"])
export const datasetStatusEnum = pgEnum("dataset_status", ["draft", "uploading", "ready", "public", "archived"])
export const taskStatusEnum = pgEnum("task_status", ["open", "closed", "completed", "cancelled"])
export const claimStatusEnum = pgEnum("claim_status", ["in_progress", "submitted", "settled", "cancelled", "expired"])
export const auditStatusEnum = pgEnum("audit_status", ["assigned", "in_review", "completed"])
export const auditResultEnum = pgEnum("audit_result", ["approved", "rejected"])
export const txnTypeEnum = pgEnum("txn_type", ["lock", "reward", "audit_fee", "refund", "platform_fee"])

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("user"),
  level: integer("level").notNull().default(1),
  name: varchar("name", { length: 100 }).notNull(),
  institution: varchar("institution", { length: 200 }),
  specialty: varchar("specialty", { length: 100 }),
  certStatus: certStatusEnum("cert_status").notNull().default("none"),
  certLicenseKey: text("cert_license_key"),
  certNote: text("cert_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const datasetUploadSessions = pgTable("dataset_upload_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id),
  datasetId: uuid("dataset_id"),
  attestationAccepted: boolean("attestation_accepted").notNull().default(false),
  attestationAcceptedAt: timestamp("attestation_accepted_at"),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const datasets = pgTable("datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id),
  name: varchar("name", { length: 200 }).notNull(),
  modality: varchar("modality", { length: 50 }).notNull(),
  status: datasetStatusEnum("status").notNull().default("draft"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const datasetFiles = pgTable("dataset_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  datasetId: uuid("dataset_id").notNull().references(() => datasets.id),
  uploadSessionId: uuid("upload_session_id").references(() => datasetUploadSessions.id),
  originalFilename: text("original_filename").notNull(),
  storageKey: text("storage_key").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }),
  contentType: varchar("content_type", { length: 100 }),
  checksum: varchar("checksum", { length: 128 }),
  status: varchar("status", { length: 32 }).notNull().default("uploaded"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const datasetCases = pgTable("dataset_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  datasetId: uuid("dataset_id").notNull().references(() => datasets.id),
  fileId: uuid("file_id").references(() => datasetFiles.id),
  caseId: varchar("case_id", { length: 100 }).notNull(),
  storageKey: text("storage_key").notNull(),
  thumbnailKey: text("thumbnail_key"),
  modality: varchar("modality", { length: 50 }),
  orderIndex: integer("order_index").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  status: varchar("status", { length: 32 }).notNull().default("ready"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  datasetCaseUnique: uniqueIndex("dataset_cases_dataset_case_unique").on(table.datasetId, table.caseId),
}))

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  publisherId: text("publisher_id").notNull().references(() => user.id),
  datasetId: uuid("dataset_id").notNull().references(() => datasets.id),
  rewardPerCase: bigint("reward_per_case", { mode: "number" }).notNull(),
  totalCases: integer("total_cases").notNull(),
  maxClaims: integer("max_claims").notNull(),
  claimedCount: integer("claimed_count").notNull().default(0),
  minLevel: integer("min_level").notNull().default(1),
  lockedAmount: bigint("locked_amount", { mode: "number" }).notNull(),
  status: taskStatusEnum("status").notNull().default("open"),
})

export const taskCases = pgTable("task_cases", {
  taskId: uuid("task_id").notNull().references(() => tasks.id),
  datasetCaseId: uuid("dataset_case_id").notNull().references(() => datasetCases.id),
  orderIndex: integer("order_index").notNull().default(0),
}, (table) => ({
  taskCaseUnique: uniqueIndex("task_cases_unique").on(table.taskId, table.datasetCaseId),
}))

export const taskClaims = pgTable("task_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").notNull().references(() => tasks.id),
  userId: text("user_id").notNull().references(() => user.id),
  completedCases: integer("completed_cases").notNull().default(0),
  status: claimStatusEnum("status").notNull().default("in_progress"),
  submittedAt: timestamp("submitted_at"),
  settledAt: timestamp("settled_at"),
}, (table) => ({
  uniqueClaim: uniqueIndex("task_claims_unique").on(table.taskId, table.userId),
}))

export const annotations = pgTable("annotations", {
  id: uuid("id").defaultRandom().primaryKey(),
  claimId: uuid("claim_id").notNull().references(() => taskClaims.id),
  datasetCaseId: uuid("dataset_case_id").notNull().references(() => datasetCases.id),
  data: jsonb("data").notNull().default({}),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
}, (table) => ({
  claimCaseIdx: uniqueIndex("annotations_claim_case").on(table.claimId, table.datasetCaseId),
}))

export const audits = pgTable("audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  claimId: uuid("claim_id").notNull().references(() => taskClaims.id),
  expertId: text("expert_id").notNull().references(() => user.id),
  status: auditStatusEnum("status").notNull().default("assigned"),
  completedAt: timestamp("completed_at"),
})

export const auditResults = pgTable("audit_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  auditId: uuid("audit_id").notNull().references(() => audits.id),
  datasetCaseId: uuid("dataset_case_id").notNull().references(() => datasetCases.id),
  result: auditResultEnum("result").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  auditCaseUnique: uniqueIndex("audit_results_audit_case_unique").on(table.auditId, table.datasetCaseId),
}))

export const walletTxns = pgTable("wallet_txns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  amount: bigint("amount", { mode: "number" }).notNull(),
  type: txnTypeEnum("type").notNull(),
  refType: varchar("ref_type", { length: 50 }),
  refId: uuid("ref_id"),
  idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("wallet_txns_user_idx").on(table.userId),
  idempotencyUnique: uniqueIndex("wallet_txns_idempotency_unique").on(table.idempotencyKey),
}))

import { and, asc, count, eq, like, sql, sum } from "drizzle-orm"

import { db, type Database } from "@/lib/db"
import {
  account,
  annotations,
  auditResults,
  audits,
  datasetCases,
  datasetFiles,
  datasetUploadSessions,
  datasets,
  session,
  taskCases,
  taskClaims,
  tasks,
  user,
  userProfiles,
  verification,
  walletTxns,
} from "@/lib/db/schema"

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0]
type Client = Database | Tx
type SettlementTxnValue = typeof walletTxns.$inferInsert

export const demoUsers = {
  institution: "u_inst_demo",
  annotator: "u_ann_l1_demo",
  annotatorTwo: "u_ann_l1_demo_2",
  expert: "u_expert_l5_demo",
} as const

export interface SeedUserInput {
  id: string
  email: string
  name: string
  role: "user" | "institution" | "admin"
  level: number
  certStatus?: "none" | "pending" | "approved" | "rejected"
  institution?: string
  specialty?: string
  initialPoints?: number
}

export interface CreateDatasetCaseInput {
  ownerId: string
  name: string
  modality: string
  originalFilename: string
  storageKey: string
  attestationAccepted: boolean
  caseId?: string
  orderIndex?: number
  metadata?: Record<string, unknown>
}

export interface PublishTaskInput {
  publisherId: string
  datasetId: string
  rewardPerCase: number
  totalCases: number
  maxClaims: number
  minLevel: number
}

export interface CreateAuditInput {
  claimId: string
  expertId: string
  results: Array<{ datasetCaseId: string; result: "approved" | "rejected"; reason?: string }>
}

export interface PublicDatasetView {
  id: string
  name: string
  modality: string
  status: string
  isPublic: boolean
  caseCount: number
  ownerName: string
  createdAt: Date
}

export interface PublicTaskView {
  id: string
  datasetId: string
  datasetName: string
  publisherName: string
  rewardPerCase: number
  totalCases: number
  maxClaims: number
  claimedCount: number
  minLevel: number
  lockedAmount: number
  status: string
}

export async function resetPlatformData(client: Client = db) {
  await client.delete(walletTxns)
  await client.delete(auditResults)
  await client.delete(audits)
  await client.delete(annotations)
  await client.delete(taskClaims)
  await client.delete(taskCases)
  await client.delete(tasks)
  await client.delete(datasetCases)
  await client.delete(datasetFiles)
  await client.delete(datasetUploadSessions)
  await client.delete(datasets)
  await client.delete(userProfiles)
  await client.delete(verification)
  await client.delete(session)
  await client.delete(account)
  await client.delete(user)
}

export async function seedPlatformUser(input: SeedUserInput, client: Client = db) {
  await client
    .insert(user)
    .values({ id: input.id, email: input.email, name: input.name, emailVerified: true })
    .onConflictDoUpdate({
      target: user.id,
      set: { email: input.email, name: input.name, emailVerified: true, updatedAt: new Date() },
    })

  await client
    .insert(userProfiles)
    .values({
      userId: input.id,
      role: input.role,
      level: input.level,
      name: input.name,
      certStatus: input.certStatus ?? "none",
      institution: input.institution,
      specialty: input.specialty,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        role: input.role,
        level: input.level,
        name: input.name,
        certStatus: input.certStatus ?? "none",
        institution: input.institution,
        specialty: input.specialty,
        updatedAt: new Date(),
      },
    })

  if (input.initialPoints && input.initialPoints > 0) {
    await client
      .insert(walletTxns)
      .values({
        userId: input.id,
        amount: input.initialPoints,
        type: "reward",
        refType: "seed",
        idempotencyKey: `seed:${input.id}`,
        note: "synthetic local seed points",
      })
      .onConflictDoNothing({ target: walletTxns.idempotencyKey })
  }
}

export async function createDatasetCase(input: CreateDatasetCaseInput, client: Database = db) {
  return client.transaction(async (tx) => {
    const [owner] = await tx
      .select({ role: userProfiles.role, certStatus: userProfiles.certStatus })
      .from(userProfiles)
      .where(eq(userProfiles.userId, input.ownerId))
      .limit(1)

    if (owner?.role !== "institution" || owner.certStatus !== "approved") {
      throw new Error("INSTITUTION_CERTIFICATION_REQUIRED")
    }
    if (!input.attestationAccepted) throw new Error("DEIDENTIFIED_ATTESTATION_REQUIRED")

    const [uploadSession] = await tx
      .insert(datasetUploadSessions)
      .values({
        ownerId: input.ownerId,
        attestationAccepted: true,
        attestationAcceptedAt: new Date(),
        status: "ready",
      })
      .returning()

    const [dataset] = await tx
      .insert(datasets)
      .values({
        ownerId: input.ownerId,
        name: input.name,
        modality: input.modality,
        status: "public",
        isPublic: true,
      })
      .returning()

    await tx.update(datasetUploadSessions).set({ datasetId: dataset.id }).where(eq(datasetUploadSessions.id, uploadSession.id))

    const [file] = await tx
      .insert(datasetFiles)
      .values({
        datasetId: dataset.id,
        uploadSessionId: uploadSession.id,
        originalFilename: input.originalFilename,
        storageKey: input.storageKey,
        contentType: "application/dicom",
        status: "uploaded",
      })
      .returning()

    const [datasetCase] = await tx
      .insert(datasetCases)
      .values({
        datasetId: dataset.id,
        fileId: file.id,
        caseId: input.caseId ?? "CASE-0001",
        storageKey: input.storageKey,
        thumbnailKey: `${input.storageKey}.thumb.jpg`,
        modality: input.modality,
        orderIndex: input.orderIndex ?? 0,
        metadata: input.metadata ?? { fixture: "synthetic-deidentified" },
        status: "ready",
      })
      .returning()

    return { uploadSession, dataset, file, datasetCase }
  })
}

export async function publishTaskWithEscrow(input: PublishTaskInput, client: Database = db) {
  return client.transaction(async (tx) => {
    const [publisher] = await tx
      .select({ role: userProfiles.role, certStatus: userProfiles.certStatus })
      .from(userProfiles)
      .where(eq(userProfiles.userId, input.publisherId))
      .limit(1)

    if (publisher?.role !== "institution" || publisher.certStatus !== "approved") {
      throw new Error("INSTITUTION_CERTIFICATION_REQUIRED")
    }

    const [dataset] = await tx.select().from(datasets).where(eq(datasets.id, input.datasetId)).limit(1)
    if (!dataset) throw new Error("DATASET_NOT_FOUND")

    const baseAmount = input.rewardPerCase * input.totalCases * input.maxClaims
    const lockedAmount = baseAmount + Math.floor(baseAmount * 0.05)
    const available = await walletAvailable(input.publisherId, tx)
    if (available < lockedAmount) throw new Error("INSUFFICIENT_BALANCE")

    const [task] = await tx
      .insert(tasks)
      .values({
        publisherId: input.publisherId,
        datasetId: input.datasetId,
        rewardPerCase: input.rewardPerCase,
        totalCases: input.totalCases,
        maxClaims: input.maxClaims,
        minLevel: input.minLevel,
        lockedAmount,
        status: "open",
      })
      .returning()

    const caseRows = await tx
      .select({ id: datasetCases.id, orderIndex: datasetCases.orderIndex })
      .from(datasetCases)
      .where(eq(datasetCases.datasetId, input.datasetId))
      .orderBy(asc(datasetCases.orderIndex))

    const selectedCases = caseRows.slice(0, input.totalCases)
    if (selectedCases.length > 0) {
      await tx.insert(taskCases).values(
        selectedCases.map((caseRow, index) => ({
          taskId: task.id,
          datasetCaseId: caseRow.id,
          orderIndex: index,
        })),
      )
    }

    await tx
      .insert(walletTxns)
      .values({
        userId: input.publisherId,
        amount: -lockedAmount,
        type: "lock",
        refType: "task",
        refId: task.id,
        idempotencyKey: `task:${task.id}:lock`,
        note: "escrow lock",
      })
      .onConflictDoNothing({ target: walletTxns.idempotencyKey })

    return task
  })
}

export async function claimTaskAtomic(taskId: string, userId: string, client: Database = db) {
  return client.transaction(async (tx) => {
    const [task] = await tx.select().from(tasks).where(eq(tasks.id, taskId)).for("update").limit(1)
    if (!task || task.status !== "open") throw new Error("TASK_NOT_OPEN")

    const [profile] = await tx
      .select({ level: userProfiles.level })
      .from(userProfiles)
      .innerJoin(user, eq(user.id, userProfiles.userId))
      .where(and(eq(userProfiles.userId, userId), eq(user.emailVerified, true)))
      .limit(1)

    if (!profile) throw new Error("USER_PROFILE_NOT_FOUND")
    if (profile.level < task.minLevel) throw new Error(`LEVEL_TOO_LOW:${task.minLevel}`)

    const [existing] = await tx
      .select({ id: taskClaims.id })
      .from(taskClaims)
      .where(and(eq(taskClaims.taskId, taskId), eq(taskClaims.userId, userId)))
      .limit(1)
    if (existing) throw new Error("DUPLICATE_CLAIM")
    if (task.claimedCount >= task.maxClaims) throw new Error("TASK_FULL")

    const nextClaimedCount = task.claimedCount + 1
    await tx
      .update(tasks)
      .set({ claimedCount: nextClaimedCount, status: nextClaimedCount >= task.maxClaims ? "closed" : task.status })
      .where(eq(tasks.id, taskId))

    const [claim] = await tx.insert(taskClaims).values({ taskId, userId, status: "in_progress" }).returning()
    return claim
  })
}

export async function createAnnotationForClaim(claimId: string, datasetCaseId: string, data: Record<string, unknown>, client: Client = db) {
  const [annotation] = await client
    .insert(annotations)
    .values({ claimId, datasetCaseId, data })
    .onConflictDoUpdate({ target: [annotations.claimId, annotations.datasetCaseId], set: { data, savedAt: new Date() } })
    .returning()
  return annotation
}

export async function createAudit(input: CreateAuditInput, client: Database = db) {
  return client.transaction(async (tx) => {
    const [expert] = await tx
      .select({ level: userProfiles.level })
      .from(userProfiles)
      .where(eq(userProfiles.userId, input.expertId))
      .limit(1)
    if (!expert || expert.level < 5) throw new Error("EXPERT_LEVEL_REQUIRED")

    const [claim] = await tx.select().from(taskClaims).where(eq(taskClaims.id, input.claimId)).limit(1)
    if (!claim) throw new Error("CLAIM_NOT_FOUND")

    const [audit] = await tx.insert(audits).values({ claimId: input.claimId, expertId: input.expertId, status: "in_review" }).returning()
    if (input.results.length > 0) {
      await tx.insert(auditResults).values(
        input.results.map((result) => ({
          auditId: audit.id,
          datasetCaseId: result.datasetCaseId,
          result: result.result,
          reason: result.reason,
        })),
      )
    }
    return audit
  })
}

export async function completeAuditSettlement(auditId: string, client: Database = db) {
  return client.transaction(async (tx) => {
    const [audit] = await tx.select().from(audits).where(eq(audits.id, auditId)).for("update").limit(1)
    if (!audit) throw new Error("AUDIT_NOT_FOUND")

    const [claim] = await tx.select().from(taskClaims).where(eq(taskClaims.id, audit.claimId)).for("update").limit(1)
    if (!claim) throw new Error("CLAIM_NOT_FOUND")

    const [task] = await tx.select().from(tasks).where(eq(tasks.id, claim.taskId)).limit(1)
    if (!task) throw new Error("TASK_NOT_FOUND")

    const prefix = `settlement:audit:${audit.id}:claim:${claim.id}`
    const existing = await tx.select().from(walletTxns).where(like(walletTxns.idempotencyKey, `${prefix}%`))
    if (existing.length > 0) return existing

    const results = await tx.select().from(auditResults).where(eq(auditResults.auditId, audit.id))
    const approvedCount = results.filter((result) => result.result === "approved").length
    const rejectedCount = results.filter((result) => result.result === "rejected").length
    const rewardAmount = task.rewardPerCase * approvedCount
    const auditFee = Math.floor(rewardAmount * 0.05)
    const refundAmount = task.rewardPerCase * rejectedCount

    const values: SettlementTxnValue[] = [
      {
        userId: claim.userId,
        amount: rewardAmount,
        type: "reward" as const,
        refType: "claim",
        refId: claim.id,
        idempotencyKey: `${prefix}:reward`,
        note: "approved case reward",
      },
      {
        userId: audit.expertId,
        amount: auditFee,
        type: "audit_fee" as const,
        refType: "audit",
        refId: audit.id,
        idempotencyKey: `${prefix}:audit_fee`,
        note: "expert audit fee",
      },
    ]
    if (refundAmount > 0) {
      values.push({
        userId: task.publisherId,
        amount: refundAmount,
        type: "refund",
        refType: "claim",
        refId: claim.id,
        idempotencyKey: `${prefix}:refund`,
        note: "rejected case refund",
      })
    }

    const inserted = await tx.insert(walletTxns).values(values).onConflictDoNothing({ target: walletTxns.idempotencyKey }).returning()
    await tx.update(taskClaims).set({ status: "settled", settledAt: new Date() }).where(eq(taskClaims.id, claim.id))
    await tx.update(audits).set({ status: "completed", completedAt: new Date() }).where(eq(audits.id, audit.id))
    return inserted
  })
}

export async function listPublicDatasets(client: Client = db): Promise<PublicDatasetView[]> {
  return client
    .select({
      id: datasets.id,
      name: datasets.name,
      modality: datasets.modality,
      status: datasets.status,
      isPublic: datasets.isPublic,
      ownerName: userProfiles.name,
      createdAt: datasets.createdAt,
      caseCount: count(datasetCases.id),
    })
    .from(datasets)
    .innerJoin(userProfiles, eq(userProfiles.userId, datasets.ownerId))
    .leftJoin(datasetCases, eq(datasetCases.datasetId, datasets.id))
    .where(eq(datasets.isPublic, true))
    .groupBy(datasets.id, userProfiles.name)
    .orderBy(asc(datasets.createdAt))
}

export async function listOpenTasks(client: Client = db): Promise<PublicTaskView[]> {
  return client
    .select({
      id: tasks.id,
      datasetId: tasks.datasetId,
      datasetName: datasets.name,
      publisherName: userProfiles.name,
      rewardPerCase: tasks.rewardPerCase,
      totalCases: tasks.totalCases,
      maxClaims: tasks.maxClaims,
      claimedCount: tasks.claimedCount,
      minLevel: tasks.minLevel,
      lockedAmount: tasks.lockedAmount,
      status: tasks.status,
    })
    .from(tasks)
    .innerJoin(datasets, eq(datasets.id, tasks.datasetId))
    .innerJoin(userProfiles, eq(userProfiles.userId, tasks.publisherId))
    .where(eq(tasks.status, "open"))
    .orderBy(asc(tasks.id))
}

export async function listDatasetCases(datasetId: string, client: Client = db) {
  return client.select().from(datasetCases).where(eq(datasetCases.datasetId, datasetId)).orderBy(asc(datasetCases.orderIndex))
}

export async function walletAvailable(userId: string, client: Client = db) {
  const [row] = await client.select({ total: sum(walletTxns.amount) }).from(walletTxns).where(eq(walletTxns.userId, userId))
  return Number(row?.total ?? 0)
}

export async function walletSummary(userId: string, client: Client = db) {
  const available = await walletAvailable(userId, client)
  const [locked] = await client
    .select({ total: sum(walletTxns.amount) })
    .from(walletTxns)
    .where(and(eq(walletTxns.userId, userId), eq(walletTxns.type, "lock")))
  const [income] = await client
    .select({ total: sum(walletTxns.amount) })
    .from(walletTxns)
    .where(and(eq(walletTxns.userId, userId), sql`${walletTxns.amount} > 0`))

  return {
    userId,
    available,
    locked: Math.abs(Number(locked?.total ?? 0)),
    totalIncome: Number(income?.total ?? 0),
  }
}

export async function seedDemoData({ reset = false }: { reset?: boolean } = {}) {
  if (reset) await resetPlatformData()

  await seedPlatformUser({
    id: demoUsers.institution,
    email: "imaging@pumch.example.test",
    name: "协和医院影像中心",
    role: "institution",
    level: 7,
    certStatus: "approved",
    institution: "协和医院",
    specialty: "放射科",
    initialPoints: 500_000,
  })
  await seedPlatformUser({
    id: demoUsers.annotator,
    email: "annotator@example.test",
    name: "李医生",
    role: "user",
    level: 3,
    certStatus: "approved",
    specialty: "放射科",
  })
  await seedPlatformUser({
    id: demoUsers.annotatorTwo,
    email: "annotator2@example.test",
    name: "王医生",
    role: "user",
    level: 2,
    certStatus: "approved",
    specialty: "影像科",
  })
  await seedPlatformUser({
    id: demoUsers.expert,
    email: "expert@example.test",
    name: "张医生",
    role: "user",
    level: 5,
    certStatus: "approved",
    specialty: "放射科",
  })

  const existingDatasets = await listPublicDatasets()
  let datasetId = existingDatasets[0]?.id
  if (!datasetId) {
    const first = await createDatasetCase({
      ownerId: demoUsers.institution,
      name: "胸部CT肺结节合成演示数据集",
      modality: "CT",
      originalFilename: "synthetic-case-001.dcm",
      storageKey: "synthetic/deidentified/chest-ct/case-001.dcm",
      attestationAccepted: true,
      caseId: "CASE-0001",
      orderIndex: 0,
    })
    datasetId = first.dataset.id
    const [file] = await db.insert(datasetFiles).values({
      datasetId,
      originalFilename: "synthetic-case-002.dcm",
      storageKey: "synthetic/deidentified/chest-ct/case-002.dcm",
      contentType: "application/dicom",
    }).returning()
    await db.insert(datasetCases).values({
      datasetId,
      fileId: file.id,
      caseId: "CASE-0002",
      storageKey: file.storageKey,
      thumbnailKey: `${file.storageKey}.thumb.jpg`,
      modality: "CT",
      orderIndex: 1,
      metadata: { fixture: "synthetic-deidentified" },
    }).onConflictDoNothing({ target: [datasetCases.datasetId, datasetCases.caseId] })
  }

  const openTasks = await listOpenTasks()
  if (openTasks.length === 0 && datasetId) {
    await publishTaskWithEscrow({
      publisherId: demoUsers.institution,
      datasetId,
      rewardPerCase: 1_000,
      totalCases: 2,
      maxClaims: 2,
      minLevel: 1,
    })
  }

  return {
    users: demoUsers,
    datasets: await listPublicDatasets(),
    tasks: await listOpenTasks(),
    institutionWallet: await walletSummary(demoUsers.institution),
  }
}

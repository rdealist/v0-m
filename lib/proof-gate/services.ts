export type UserRole = "user" | "institution" | "admin"
export type CertStatus = "none" | "pending" | "approved" | "rejected"
export type TaskStatus = "open" | "closed" | "completed" | "cancelled"
export type ClaimStatus = "in_progress" | "submitted" | "settled" | "cancelled" | "expired"
export type AuditResult = "approved" | "rejected"
export type TxnType = "lock" | "reward" | "audit_fee" | "refund" | "platform_fee"

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  passwordHash?: never
}

export interface UserProfile {
  userId: string
  role: UserRole
  level: number
  name: string
  certStatus: CertStatus
}

export interface ProofSession {
  user: AuthUser & Pick<UserProfile, "role" | "level" | "certStatus" | "name">
}

export interface DatasetCaseRecord {
  id: string
  datasetId: string
  fileId: string
  caseId: string
  storageKey: string
  thumbnailKey?: string
  orderIndex: number
}

export interface WalletTxn {
  id: string
  userId: string
  amount: number
  type: TxnType
  refType: string
  refId: string
  idempotencyKey: string
}

interface DatasetRecord {
  id: string
  ownerId: string
  name: string
  modality: string
  isPublic: boolean
  status: "draft" | "ready" | "public"
}

interface DatasetFileRecord {
  id: string
  datasetId: string
  originalFilename: string
  storageKey: string
  contentType: string
}

interface TaskRecord {
  id: string
  publisherId: string
  datasetId: string
  rewardPerCase: number
  totalCases: number
  maxClaims: number
  claimedCount: number
  minLevel: number
  lockedAmount: number
  status: TaskStatus
}

interface ClaimRecord {
  id: string
  taskId: string
  userId: string
  status: ClaimStatus
}

interface AuditRecord {
  id: string
  claimId: string
  expertId: string
  status: "assigned" | "in_review" | "completed"
}

interface AuditResultRecord {
  auditId: string
  datasetCaseId: string
  result: AuditResult
  reason?: string
}

class Mutex {
  private queue = Promise.resolve()

  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    const previous = this.queue
    let release!: () => void
    this.queue = new Promise<void>((resolve) => {
      release = resolve
    })
    await previous
    try {
      return await fn()
    } finally {
      release()
    }
  }
}

export class ProofGateStore {
  readonly authUsers = new Map<string, AuthUser>()
  readonly profiles = new Map<string, UserProfile>()
  readonly datasets = new Map<string, DatasetRecord>()
  readonly datasetFiles = new Map<string, DatasetFileRecord>()
  readonly datasetCases = new Map<string, DatasetCaseRecord>()
  readonly tasks = new Map<string, TaskRecord>()
  readonly claims = new Map<string, ClaimRecord>()
  readonly audits = new Map<string, AuditRecord>()
  readonly auditResults: AuditResultRecord[] = []
  readonly walletTxns: WalletTxn[] = []

  private readonly taskMutexes = new Map<string, Mutex>()
  private sequence = 0

  nextId(prefix: string) {
    this.sequence += 1
    return `${prefix}_${this.sequence.toString().padStart(4, "0")}`
  }

  taskMutex(taskId: string) {
    const existing = this.taskMutexes.get(taskId)
    if (existing) return existing
    const created = new Mutex()
    this.taskMutexes.set(taskId, created)
    return created
  }
}

export function createProofSession(store: ProofGateStore, userId: string): ProofSession {
  const authUser = store.authUsers.get(userId)
  if (!authUser) throw new Error("AUTH_USER_NOT_FOUND")
  if ("passwordHash" in authUser) throw new Error("AUTH_USER_MUST_NOT_OWN_PASSWORD_HASH")

  const profile = store.profiles.get(userId)
  if (!profile) throw new Error("USER_PROFILE_NOT_FOUND")

  return {
    user: {
      ...authUser,
      name: profile.name,
      role: profile.role,
      level: profile.level,
      certStatus: profile.certStatus,
    },
  }
}

export function seedUser(
  store: ProofGateStore,
  input: { id: string; email: string; role: UserRole; level: number; certStatus?: CertStatus; name?: string; initialPoints?: number },
) {
  store.authUsers.set(input.id, { id: input.id, email: input.email, emailVerified: true })
  store.profiles.set(input.id, {
    userId: input.id,
    role: input.role,
    level: input.level,
    name: input.name ?? input.id,
    certStatus: input.certStatus ?? "none",
  })
  if (input.initialPoints) {
    store.walletTxns.push({
      id: store.nextId("txn"),
      userId: input.id,
      amount: input.initialPoints,
      type: "reward",
      refType: "seed",
      refId: input.id,
      idempotencyKey: `seed:${input.id}`,
    })
  }
}

export function createDatasetCaseProof(
  store: ProofGateStore,
  input: {
    ownerId: string
    name: string
    modality: string
    originalFilename: string
    storageKey: string
    attestationAccepted: boolean
  },
): DatasetCaseRecord {
  const owner = store.profiles.get(input.ownerId)
  if (owner?.role !== "institution" || owner.certStatus !== "approved") {
    throw new Error("INSTITUTION_CERTIFICATION_REQUIRED")
  }
  if (!input.attestationAccepted) throw new Error("DEIDENTIFIED_ATTESTATION_REQUIRED")

  const datasetId = store.nextId("dataset")
  const fileId = store.nextId("file")
  const datasetCase: DatasetCaseRecord = {
    id: store.nextId("case"),
    datasetId,
    fileId,
    caseId: "CASE-0001",
    storageKey: input.storageKey,
    thumbnailKey: `${input.storageKey}.thumb.jpg`,
    orderIndex: 0,
  }

  store.datasets.set(datasetId, {
    id: datasetId,
    ownerId: input.ownerId,
    name: input.name,
    modality: input.modality,
    isPublic: true,
    status: "public",
  })
  store.datasetFiles.set(fileId, {
    id: fileId,
    datasetId,
    originalFilename: input.originalFilename,
    storageKey: input.storageKey,
    contentType: "application/dicom",
  })
  store.datasetCases.set(datasetCase.id, datasetCase)
  return datasetCase
}

export function publishTaskWithEscrow(
  store: ProofGateStore,
  input: { publisherId: string; datasetId: string; rewardPerCase: number; totalCases: number; maxClaims: number; minLevel: number },
): TaskRecord {
  const publisher = store.profiles.get(input.publisherId)
  if (publisher?.role !== "institution" || publisher.certStatus !== "approved") {
    throw new Error("INSTITUTION_CERTIFICATION_REQUIRED")
  }
  if (!store.datasets.has(input.datasetId)) throw new Error("DATASET_NOT_FOUND")

  const base = input.rewardPerCase * input.totalCases * input.maxClaims
  const lockedAmount = base + Math.floor(base * 0.05)
  const available = walletTotal(store, input.publisherId)
  if (available < lockedAmount) throw new Error("INSUFFICIENT_BALANCE")

  const task: TaskRecord = {
    id: store.nextId("task"),
    publisherId: input.publisherId,
    datasetId: input.datasetId,
    rewardPerCase: input.rewardPerCase,
    totalCases: input.totalCases,
    maxClaims: input.maxClaims,
    claimedCount: 0,
    minLevel: input.minLevel,
    lockedAmount,
    status: "open",
  }
  store.tasks.set(task.id, task)
  store.walletTxns.push({
    id: store.nextId("txn"),
    userId: input.publisherId,
    amount: -lockedAmount,
    type: "lock",
    refType: "task",
    refId: task.id,
    idempotencyKey: `task:${task.id}:lock`,
  })
  return task
}

export async function claimTaskAtomic(store: ProofGateStore, taskId: string, userId: string): Promise<ClaimRecord> {
  return store.taskMutex(taskId).runExclusive(() => {
    const task = store.tasks.get(taskId)
    if (!task || task.status !== "open") throw new Error("TASK_NOT_OPEN")

    const profile = store.profiles.get(userId)
    if (!profile) throw new Error("USER_PROFILE_NOT_FOUND")
    if (!store.authUsers.get(userId)?.emailVerified) throw new Error("EMAIL_VERIFICATION_REQUIRED")
    if (profile.level < task.minLevel) throw new Error(`LEVEL_TOO_LOW:${task.minLevel}`)

    const duplicate = [...store.claims.values()].some((claim) => claim.taskId === taskId && claim.userId === userId)
    if (duplicate) throw new Error("DUPLICATE_CLAIM")
    if (task.claimedCount >= task.maxClaims) throw new Error("TASK_FULL")

    task.claimedCount += 1
    if (task.claimedCount >= task.maxClaims) task.status = "closed"

    const claim: ClaimRecord = { id: store.nextId("claim"), taskId, userId, status: "in_progress" }
    store.claims.set(claim.id, claim)
    return claim
  })
}

export function createAudit(store: ProofGateStore, input: { claimId: string; expertId: string; results: Array<{ datasetCaseId: string; result: AuditResult; reason?: string }> }) {
  const expert = store.profiles.get(input.expertId)
  if (!expert || expert.level < 5) throw new Error("EXPERT_LEVEL_REQUIRED")
  if (!store.claims.has(input.claimId)) throw new Error("CLAIM_NOT_FOUND")

  const audit: AuditRecord = { id: store.nextId("audit"), claimId: input.claimId, expertId: input.expertId, status: "in_review" }
  store.audits.set(audit.id, audit)
  for (const result of input.results) store.auditResults.push({ auditId: audit.id, ...result })
  return audit
}

export function completeAuditSettlement(store: ProofGateStore, auditId: string): WalletTxn[] {
  const audit = store.audits.get(auditId)
  if (!audit) throw new Error("AUDIT_NOT_FOUND")
  const claim = store.claims.get(audit.claimId)
  if (!claim) throw new Error("CLAIM_NOT_FOUND")
  const task = store.tasks.get(claim.taskId)
  if (!task) throw new Error("TASK_NOT_FOUND")

  const idempotencyPrefix = `settlement:audit:${audit.id}:claim:${claim.id}`
  const existing = store.walletTxns.filter((txn) => txn.idempotencyKey.startsWith(idempotencyPrefix))
  if (existing.length > 0) return existing

  const results = store.auditResults.filter((result) => result.auditId === audit.id)
  const approvedCount = results.filter((result) => result.result === "approved").length
  const rejectedCount = results.filter((result) => result.result === "rejected").length

  const rewardAmount = task.rewardPerCase * approvedCount
  const auditFee = Math.floor(rewardAmount * 0.05)
  const refundAmount = task.rewardPerCase * rejectedCount

  const txns: WalletTxn[] = [
    {
      id: store.nextId("txn"),
      userId: claim.userId,
      amount: rewardAmount,
      type: "reward",
      refType: "claim",
      refId: claim.id,
      idempotencyKey: `${idempotencyPrefix}:reward`,
    },
    {
      id: store.nextId("txn"),
      userId: audit.expertId,
      amount: auditFee,
      type: "audit_fee",
      refType: "audit",
      refId: audit.id,
      idempotencyKey: `${idempotencyPrefix}:audit_fee`,
    },
  ]

  if (refundAmount > 0) {
    txns.push({
      id: store.nextId("txn"),
      userId: task.publisherId,
      amount: refundAmount,
      type: "refund",
      refType: "claim",
      refId: claim.id,
      idempotencyKey: `${idempotencyPrefix}:refund`,
    })
  }

  store.walletTxns.push(...txns)
  audit.status = "completed"
  claim.status = "settled"
  return txns
}

export function walletTotal(store: ProofGateStore, userId: string) {
  return store.walletTxns.filter((txn) => txn.userId === userId).reduce((sum, txn) => sum + txn.amount, 0)
}

import { describe, expect, it } from "vitest"
import {
  claimTaskAtomic,
  completeAuditSettlement,
  createAudit,
  createDatasetCaseProof,
  createProofSession,
  ProofGateStore,
  publishTaskWithEscrow,
  seedUser,
  walletTotal,
} from "./services"

function setupStore() {
  const store = new ProofGateStore()
  seedUser(store, {
    id: "institution-1",
    email: "inst@example.test",
    role: "institution",
    level: 1,
    certStatus: "approved",
    name: "Seed Institution",
    initialPoints: 10_000,
  })
  seedUser(store, { id: "annotator-1", email: "a1@example.test", role: "user", level: 1, name: "Annotator 1" })
  seedUser(store, { id: "annotator-2", email: "a2@example.test", role: "user", level: 1, name: "Annotator 2" })
  seedUser(store, { id: "expert-1", email: "expert@example.test", role: "user", level: 5, name: "Expert" })
  return store
}

describe("thin architecture proof gate", () => {
  it("PFG-1 exposes role/level through profile without platform password ownership", () => {
    const store = setupStore()
    const session = createProofSession(store, "institution-1")

    expect(session.user.role).toBe("institution")
    expect(session.user.level).toBe(1)
    expect(session.user.certStatus).toBe("approved")
    expect("passwordHash" in session.user).toBe(false)
  })

  it("PFG-2 creates a stable dataset case only after deidentified-data attestation", () => {
    const store = setupStore()

    expect(() => createDatasetCaseProof(store, {
      ownerId: "institution-1",
      name: "Chest CT",
      modality: "CT",
      originalFilename: "case001.dcm",
      storageKey: "dicom/institution-1/dataset/case001.dcm",
      attestationAccepted: false,
    })).toThrow("DEIDENTIFIED_ATTESTATION_REQUIRED")

    const datasetCase = createDatasetCaseProof(store, {
      ownerId: "institution-1",
      name: "Chest CT",
      modality: "CT",
      originalFilename: "case001.dcm",
      storageKey: "dicom/institution-1/dataset/case001.dcm",
      attestationAccepted: true,
    })

    expect(datasetCase.caseId).toBe("CASE-0001")
    expect(datasetCase.storageKey).toBe("dicom/institution-1/dataset/case001.dcm")
    expect(datasetCase.orderIndex).toBe(0)
    expect(store.datasetCases.get(datasetCase.id)).toEqual(datasetCase)
  })

  it("PFG-3 publishes a task with an escrow lock transaction", () => {
    const store = setupStore()
    const datasetCase = createDatasetCaseProof(store, {
      ownerId: "institution-1",
      name: "Chest CT",
      modality: "CT",
      originalFilename: "case001.dcm",
      storageKey: "dicom/institution-1/dataset/case001.dcm",
      attestationAccepted: true,
    })

    const task = publishTaskWithEscrow(store, {
      publisherId: "institution-1",
      datasetId: datasetCase.datasetId,
      rewardPerCase: 1_000,
      totalCases: 2,
      maxClaims: 1,
      minLevel: 1,
    })

    expect(task.lockedAmount).toBe(2_100)
    expect(walletTotal(store, "institution-1")).toBe(7_900)
    expect(store.walletTxns.some((txn) => txn.type === "lock" && txn.refId === task.id && txn.idempotencyKey === `task:${task.id}:lock`)).toBe(true)
  })

  it("PFG-4 allows exactly one concurrent claim for a one-slot task", async () => {
    const store = setupStore()
    const datasetCase = createDatasetCaseProof(store, {
      ownerId: "institution-1",
      name: "Chest CT",
      modality: "CT",
      originalFilename: "case001.dcm",
      storageKey: "dicom/institution-1/dataset/case001.dcm",
      attestationAccepted: true,
    })
    const task = publishTaskWithEscrow(store, {
      publisherId: "institution-1",
      datasetId: datasetCase.datasetId,
      rewardPerCase: 1_000,
      totalCases: 1,
      maxClaims: 1,
      minLevel: 1,
    })

    const outcomes = await Promise.allSettled([
      claimTaskAtomic(store, task.id, "annotator-1"),
      claimTaskAtomic(store, task.id, "annotator-2"),
    ])

    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1)
    expect(outcomes.filter((outcome) => outcome.status === "rejected")).toHaveLength(1)
    expect(store.tasks.get(task.id)?.claimedCount).toBe(1)
    expect(store.tasks.get(task.id)?.status).toBe("closed")
    expect([...store.claims.values()].filter((claim) => claim.taskId === task.id)).toHaveLength(1)
  })

  it("PFG-5 settles a mixed audit once and only once", async () => {
    const store = setupStore()
    const firstCase = createDatasetCaseProof(store, {
      ownerId: "institution-1",
      name: "Chest CT",
      modality: "CT",
      originalFilename: "case001.dcm",
      storageKey: "dicom/institution-1/dataset/case001.dcm",
      attestationAccepted: true,
    })
    const secondCase = { ...firstCase, id: store.nextId("case"), caseId: "CASE-0002", storageKey: "dicom/institution-1/dataset/case002.dcm", orderIndex: 1 }
    store.datasetCases.set(secondCase.id, secondCase)

    const task = publishTaskWithEscrow(store, {
      publisherId: "institution-1",
      datasetId: firstCase.datasetId,
      rewardPerCase: 1_000,
      totalCases: 2,
      maxClaims: 1,
      minLevel: 1,
    })
    const claim = await claimTaskAtomic(store, task.id, "annotator-1")
    const audit = createAudit(store, {
      claimId: claim.id,
      expertId: "expert-1",
      results: [
        { datasetCaseId: firstCase.id, result: "approved" },
        { datasetCaseId: secondCase.id, result: "rejected", reason: "insufficient boundary" },
      ],
    })

    const firstSettlement = completeAuditSettlement(store, audit.id)
    const secondSettlement = completeAuditSettlement(store, audit.id)

    expect(firstSettlement).toHaveLength(3)
    expect(secondSettlement).toEqual(firstSettlement)
    expect(store.walletTxns.filter((txn) => txn.idempotencyKey.startsWith(`settlement:audit:${audit.id}:claim:${claim.id}`))).toHaveLength(3)
    expect(walletTotal(store, "annotator-1")).toBe(1_000)
    expect(walletTotal(store, "expert-1")).toBe(50)
    expect(walletTotal(store, "institution-1")).toBe(8_900)
    expect(store.claims.get(claim.id)?.status).toBe("settled")
    expect(store.audits.get(audit.id)?.status).toBe("completed")
  })
})

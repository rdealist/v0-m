import { describe, expect, it, beforeEach } from "vitest"

import { db } from "@/lib/db"
import { datasetCases, tasks } from "@/lib/db/schema"
import {
  claimTaskAtomic,
  completeAuditSettlement,
  createAnnotationForClaim,
  createAudit,
  createDatasetCase,
  demoUsers,
  listDatasetCases,
  listOpenTasks,
  listPublicDatasets,
  publishTaskWithEscrow,
  resetPlatformData,
  seedPlatformUser,
  walletSummary,
} from "@/lib/platform/services"

const runDb = process.env.RUN_DB_TESTS === "1"
const maybeDescribe = runDb ? describe : describe.skip

maybeDescribe("PostgreSQL-backed platform proof flow", () => {
  beforeEach(async () => {
    await resetPlatformData()
    await seedPlatformUser({ id: demoUsers.institution, email: "inst-db@example.test", name: "DB Test Institution", role: "institution", level: 7, certStatus: "approved", initialPoints: 50_000 })
    await seedPlatformUser({ id: demoUsers.annotator, email: "ann-db@example.test", name: "DB Test Annotator", role: "user", level: 2, certStatus: "approved" })
    await seedPlatformUser({ id: demoUsers.annotatorTwo, email: "ann2-db@example.test", name: "DB Test Annotator 2", role: "user", level: 2, certStatus: "approved" })
    await seedPlatformUser({ id: demoUsers.expert, email: "expert-db@example.test", name: "DB Test Expert", role: "user", level: 5, certStatus: "approved" })
  })

  it("creates dataset/cases, publishes escrow task, atomically claims, and settles idempotently", async () => {
    const first = await createDatasetCase({
      ownerId: demoUsers.institution,
      name: "DB Synthetic CT",
      modality: "CT",
      originalFilename: "case001.dcm",
      storageKey: "synthetic/db/case001.dcm",
      attestationAccepted: true,
      caseId: "CASE-0001",
    })
    await db.insert(datasetCases).values({
      datasetId: first.dataset.id,
      caseId: "CASE-0002",
      storageKey: "synthetic/db/case002.dcm",
      thumbnailKey: "synthetic/db/case002.dcm.thumb.jpg",
      modality: "CT",
      orderIndex: 1,
    })

    const publicDatasets = await listPublicDatasets()
    expect(publicDatasets).toHaveLength(1)
    expect(publicDatasets[0].caseCount).toBe(2)

    const task = await publishTaskWithEscrow({
      publisherId: demoUsers.institution,
      datasetId: first.dataset.id,
      rewardPerCase: 1_000,
      totalCases: 2,
      maxClaims: 1,
      minLevel: 1,
    })
    expect(task.lockedAmount).toBe(2_100)
    expect((await listOpenTasks())[0].id).toBe(task.id)

    const outcomes = await Promise.allSettled([
      claimTaskAtomic(task.id, demoUsers.annotator),
      claimTaskAtomic(task.id, demoUsers.annotatorTwo),
    ])
    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1)
    expect(outcomes.filter((outcome) => outcome.status === "rejected")).toHaveLength(1)

    const [closedTask] = await db.select().from(tasks)
    expect(closedTask.claimedCount).toBe(1)
    expect(closedTask.status).toBe("closed")

    const claim = outcomes.find((outcome) => outcome.status === "fulfilled")?.value
    expect(claim).toBeDefined()
    if (!claim) throw new Error("CLAIM_NOT_CREATED")
    const cases = await listDatasetCases(first.dataset.id)
    await createAnnotationForClaim(claim.id, cases[0].id, { label: "approved synthetic nodule" })
    await createAnnotationForClaim(claim.id, cases[1].id, { label: "rejected synthetic nodule" })
    const audit = await createAudit({
      claimId: claim.id,
      expertId: demoUsers.expert,
      results: [
        { datasetCaseId: cases[0].id, result: "approved" },
        { datasetCaseId: cases[1].id, result: "rejected", reason: "synthetic boundary mismatch" },
      ],
    })

    const firstSettlement = await completeAuditSettlement(audit.id)
    const secondSettlement = await completeAuditSettlement(audit.id)
    expect(firstSettlement).toHaveLength(3)
    expect(secondSettlement).toHaveLength(3)
    expect(await walletSummary(demoUsers.annotator)).toMatchObject({ available: 1_000, totalIncome: 1_000 })
    expect(await walletSummary(demoUsers.expert)).toMatchObject({ available: 50, totalIncome: 50 })
    expect((await walletSummary(demoUsers.institution)).available).toBe(48_900)
  })
})

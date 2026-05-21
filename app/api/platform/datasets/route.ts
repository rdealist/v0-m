import { NextRequest, NextResponse } from "next/server"

import { createDatasetCase, demoUsers, listPublicDatasets } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function GET() {
  const datasets = await listPublicDatasets()
  return NextResponse.json({ datasets })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const ownerId = request.headers.get("x-user-id") ?? body.ownerId ?? demoUsers.institution
    const result = await createDatasetCase({
      ownerId,
      name: String(body.name ?? "本地演示合成影像数据集"),
      modality: String(body.modality ?? "CT"),
      originalFilename: String(body.originalFilename ?? "synthetic-case.dcm"),
      storageKey: String(body.storageKey ?? `synthetic/deidentified/${Date.now()}-case.dcm`),
      attestationAccepted: Boolean(body.attestationAccepted),
      caseId: body.caseId ? String(body.caseId) : undefined,
      orderIndex: body.orderIndex == null ? undefined : Number(body.orderIndex),
      metadata: { source: "local-api", ...(typeof body.metadata === "object" && body.metadata ? body.metadata : {}) },
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 400 })
  }
}

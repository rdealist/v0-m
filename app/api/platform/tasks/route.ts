import { NextRequest, NextResponse } from "next/server"

import { demoUsers, listOpenTasks, publishTaskWithEscrow } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function GET() {
  const tasks = await listOpenTasks()
  return NextResponse.json({ tasks })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const publisherId = request.headers.get("x-user-id") ?? body.publisherId ?? demoUsers.institution
    const task = await publishTaskWithEscrow({
      publisherId,
      datasetId: String(body.datasetId),
      rewardPerCase: Number(body.rewardPerCase ?? 1000),
      totalCases: Number(body.totalCases ?? 1),
      maxClaims: Number(body.maxClaims ?? 1),
      minLevel: Number(body.minLevel ?? 1),
    })
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 400 })
  }
}

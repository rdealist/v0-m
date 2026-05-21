import { NextRequest, NextResponse } from "next/server"

import { claimTaskAtomic, demoUsers } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await context.params
    const body = await request.json().catch(() => ({}))
    const userId = request.headers.get("x-user-id") ?? body.userId ?? demoUsers.annotator
    const claim = await claimTaskAtomic(taskId, userId)
    return NextResponse.json({ claim }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 400 })
  }
}

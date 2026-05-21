import { NextResponse } from "next/server"

import { completeAuditSettlement } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function POST(_request: Request, context: { params: Promise<{ auditId: string }> }) {
  try {
    const { auditId } = await context.params
    const transactions = await completeAuditSettlement(auditId)
    return NextResponse.json({ transactions })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 400 })
  }
}

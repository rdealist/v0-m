import { NextRequest, NextResponse } from "next/server"

import { demoUsers, walletSummary } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") ?? request.headers.get("x-user-id") ?? demoUsers.institution
  const wallet = await walletSummary(userId)
  return NextResponse.json({ wallet })
}

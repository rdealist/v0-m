import { NextResponse } from "next/server"

import { listOpenTasks } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function GET() {
  const tasks = await listOpenTasks()
  return NextResponse.json({ tasks })
}

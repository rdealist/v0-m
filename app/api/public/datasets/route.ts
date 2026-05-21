import { NextResponse } from "next/server"

import { listPublicDatasets } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function GET() {
  const datasets = await listPublicDatasets()
  return NextResponse.json({ datasets })
}

import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { listOpenTasks, listPublicDatasets, walletSummary, demoUsers } from "@/lib/platform/services"

export const runtime = "nodejs"

export async function GET() {
  const [{ ok }] = await db.execute<{ ok: number }>(sql`select 1 as ok`)
  const [datasets, tasks, institutionWallet] = await Promise.all([
    listPublicDatasets(),
    listOpenTasks(),
    walletSummary(demoUsers.institution),
  ])

  return NextResponse.json({
    ok: ok === 1,
    database: "postgres",
    counts: {
      publicDatasets: datasets.length,
      openTasks: tasks.length,
    },
    institutionWallet,
  })
}

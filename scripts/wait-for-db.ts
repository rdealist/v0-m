import postgres from "postgres"

import { getDatabaseUrl } from "@/lib/db"

const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS ?? 30_000)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const sql = postgres(getDatabaseUrl(), { max: 1, prepare: false })
    try {
      const [row] = await sql<{ ok: number }[]>`select 1 as ok`
      await sql.end({ timeout: 1 })
      if (row?.ok === 1) {
        console.log(JSON.stringify({ ok: true, waitedMs: Date.now() - start }))
        return
      }
    } catch {
      await sql.end({ timeout: 1 }).catch(() => undefined)
      await sleep(750)
    }
  }

  console.error(JSON.stringify({ ok: false, timeoutMs, databaseUrl: getDatabaseUrl().replace(/:[^:@/]+@/, ":***@") }))
  process.exit(1)
}

main()

import { sqlClient } from "@/lib/db"
import { seedDemoData } from "@/lib/platform/services"

const reset = process.argv.includes("--reset") || process.env.SEED_RESET === "1"

seedDemoData({ reset })
  .then((summary) => {
    console.log(JSON.stringify({ ok: true, reset, summary }, null, 2))
  })
  .finally(async () => {
    await sqlClient.end({ timeout: 5 })
  })

import { migrate } from "drizzle-orm/postgres-js/migrator"

import { db, sqlClient } from "@/lib/db"

migrate(db, { migrationsFolder: "drizzle" })
  .then(() => {
    console.log(JSON.stringify({ ok: true, migrationsFolder: "drizzle" }))
  })
  .finally(async () => {
    await sqlClient.end({ timeout: 5 })
  })

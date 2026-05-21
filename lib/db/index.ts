import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/lib/db/schema"

const fallbackDatabaseUrl = "postgres://postgres:postgres@localhost:54329/v0_m"

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? fallbackDatabaseUrl
}

type GlobalWithDatabase = typeof globalThis & {
  __v0mSqlClient?: postgres.Sql
}

const globalForDatabase = globalThis as GlobalWithDatabase

export const sqlClient = globalForDatabase.__v0mSqlClient ?? postgres(getDatabaseUrl(), {
  max: 1,
  prepare: false,
})

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__v0mSqlClient = sqlClient
}

export const db = drizzle(sqlClient, { schema })
export type Database = typeof db

import { readFileSync } from "node:fs"

import { getTableColumns } from "drizzle-orm"
import { describe, expect, it } from "vitest"

import { mergeAuthUserWithProfile } from "@/lib/auth-helpers"
import * as schema from "@/lib/db/schema"

describe("adapter-backed schema closure", () => {
  it("TS-A3 keeps auth ownership in Better Auth tables and platform fields in user_profiles", async () => {
    const userColumns = getTableColumns(schema.user)
    const accountColumns = getTableColumns(schema.account)
    const profileColumns = getTableColumns(schema.userProfiles)
    const route = await import("@/app/api/auth/[...all]/route")

    expect(Object.keys(userColumns)).toEqual(expect.arrayContaining(["id", "email", "emailVerified", "createdAt", "updatedAt"]))
    expect(Object.keys(accountColumns)).toContain("password")
    expect(Object.keys(profileColumns)).toEqual(expect.arrayContaining(["userId", "role", "level", "certStatus", "name"]))
    expect(Object.keys(profileColumns)).not.toContain("password")
    expect(Object.keys(profileColumns)).not.toContain("passwordHash")
    expect(typeof route.GET).toBe("function")
    expect(typeof route.POST).toBe("function")
  })

  it("merges Better Auth user data with safe platform profile defaults", () => {
    const merged = mergeAuthUserWithProfile({
      id: "u_1",
      email: "doctor@example.test",
      emailVerified: true,
      name: null,
    })

    expect(merged).toMatchObject({
      id: "u_1",
      email: "doctor@example.test",
      role: "user",
      level: 1,
      certStatus: "none",
      name: "doctor@example.test",
    })
    expect("passwordHash" in merged).toBe(false)
  })

  it("TS-B4/TS-C3/TS-D5 persistence invariants are present in canonical schema", () => {
    const schemaSource = readFileSync("lib/db/schema.ts", "utf8")

    expect(schemaSource).toContain("dataset_cases_dataset_case_unique")
    expect(schemaSource).toContain("task_claims_unique")
    expect(schemaSource).toContain("wallet_txns_idempotency_unique")
    expect(schemaSource).toContain("attestation_accepted")
    expect(schemaSource).toContain("storage_key")
    expect(schemaSource).toContain("order_index")
  })
})

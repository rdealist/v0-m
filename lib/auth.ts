import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { customSession } from "better-auth/plugins"
import { eq } from "drizzle-orm"

import { mergeAuthUserWithProfile } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

const authSecret = process.env.BETTER_AUTH_SECRET ?? "dev-only-change-me-dev-only-change-me"
const authBaseUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const auth = betterAuth({
  baseURL: authBaseUrl,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const [profile] = await db
        .select({
          role: schema.userProfiles.role,
          level: schema.userProfiles.level,
          certStatus: schema.userProfiles.certStatus,
          name: schema.userProfiles.name,
        })
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, user.id))
        .limit(1)

      return {
        user: mergeAuthUserWithProfile(user, profile),
        session,
      }
    }),
    nextCookies(),
  ],
})

export type Auth = typeof auth
export type PlatformSession = typeof auth.$Infer.Session

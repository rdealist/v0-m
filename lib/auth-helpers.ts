import type { certStatusEnum, userRoleEnum } from "@/lib/db/schema"

export type UserRole = typeof userRoleEnum.enumValues[number]
export type CertStatus = typeof certStatusEnum.enumValues[number]

export interface AuthSessionUserBase {
  id: string
  email: string
  emailVerified: boolean
  name?: string | null
  image?: string | null
}

export interface PlatformProfileSummary {
  role: UserRole
  level: number
  certStatus: CertStatus
  name: string
}

export type PlatformSessionUser = AuthSessionUserBase & PlatformProfileSummary

export function mergeAuthUserWithProfile(
  user: AuthSessionUserBase,
  profile?: Partial<PlatformProfileSummary> | null,
): PlatformSessionUser {
  return {
    ...user,
    role: profile?.role ?? "user",
    level: profile?.level ?? 1,
    certStatus: profile?.certStatus ?? "none",
    name: profile?.name ?? user.name ?? user.email,
  }
}

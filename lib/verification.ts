import { ApiError } from "@/lib/api"
import type { AuthUser } from "@fxprime/types"

export function needsEmailVerification(user: AuthUser | null | undefined): boolean {
  return !!user && !user.isVerified
}

export function isEmailNotVerifiedError(err: unknown): boolean {
  return err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED"
}

export function handleVerificationError(
  err: unknown,
  onBlocked?: () => void
): boolean {
  if (isEmailNotVerifiedError(err)) {
    onBlocked?.()
    return true
  }
  return false
}

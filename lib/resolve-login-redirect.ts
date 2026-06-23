import type { Role } from "@fxprime/types"
import { resolvePostAuthRedirect } from "@/lib/safe-redirect"

export function resolveLoginRedirect(
  role: Role | string,
  redirectParam: string | null | undefined
): string {
  return resolvePostAuthRedirect(redirectParam, role)
}

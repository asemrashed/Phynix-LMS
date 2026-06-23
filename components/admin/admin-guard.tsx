"use client"

import type { Role } from "@fxprime/types"
import { useRequireRole } from "@/lib/use-require-role"

const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"]

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, allowed } = useRequireRole(ADMIN_ROLES)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}

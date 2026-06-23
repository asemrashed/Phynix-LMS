"use client"

import type { Role } from "@fxprime/types"
import { useRequireRole } from "@/lib/use-require-role"

const INSTRUCTOR_ROLES: Role[] = ["INSTRUCTOR"]

export function InstructorGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, allowed } = useRequireRole(INSTRUCTOR_ROLES)

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

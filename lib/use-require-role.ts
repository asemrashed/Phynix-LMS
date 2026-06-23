"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Role } from "@fxprime/types"
import { useAuth } from "@/lib/auth-context"
import { getDefaultPanelPath } from "@/lib/get-default-panel"

export function useRequireRole(roles: Role[]) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const allowed = !!user && roles.includes(user.role)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (!allowed) {
      router.push(getDefaultPanelPath(user.role))
    }
  }, [isLoading, user, allowed, router])

  return { user, isLoading, allowed }
}

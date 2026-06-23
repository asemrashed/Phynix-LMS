"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  getDefaultPanelPath,
  STUDENT_PANEL_ROLES,
} from "@/lib/get-default-panel"

export function StudentPanelGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const isStaffOnStudentPanel = !!user && !STUDENT_PANEL_ROLES.includes(user.role)

  useEffect(() => {
    if (!isLoading && isStaffOnStudentPanel) {
      router.replace(getDefaultPanelPath(user!.role))
    }
  }, [isLoading, isStaffOnStudentPanel, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isStaffOnStudentPanel) return null

  return <>{children}</>
}

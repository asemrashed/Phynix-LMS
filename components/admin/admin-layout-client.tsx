"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { PanelShell } from "@/components/panel/panel-shell"
import { AdminGuard } from "@/components/admin/admin-guard"
import { ADMIN_NAV } from "@/lib/panel-nav"

function isCourseBuilderPath(pathname: string) {
  return pathname.startsWith("/admin/course/") || pathname === "/admin/courses/new"
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showRightSidebar = !isCourseBuilderPath(pathname)

  return (
    <AdminGuard>
      <PanelShell
        nav={ADMIN_NAV}
        panelTitle="Admin Panel"
        homeHref="/admin"
        showRightSidebar={showRightSidebar}
      >
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
          {children}
        </Suspense>
      </PanelShell>
    </AdminGuard>
  )
}

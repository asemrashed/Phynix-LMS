"use client"

import { PanelShell } from "@/components/panel/panel-shell"
import { StudentPanelGuard } from "@/components/dashboard/student-panel-guard"
import { STUDENT_NAV } from "@/lib/panel-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentPanelGuard>
      <PanelShell
        nav={STUDENT_NAV}
        panelTitle="Student Panel"
        homeHref="/dashboard"
        showRightSidebar
        showEmailBanner
        showSubscriptionBadge
      >
        {children}
      </PanelShell>
    </StudentPanelGuard>
  )
}

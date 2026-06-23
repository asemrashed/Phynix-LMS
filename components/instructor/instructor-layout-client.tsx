"use client"

import { PanelShell } from "@/components/panel/panel-shell"
import { InstructorGuard } from "@/components/instructor/instructor-guard"
import { INSTRUCTOR_NAV } from "@/lib/panel-nav"

export function InstructorLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <InstructorGuard>
      <PanelShell
        nav={INSTRUCTOR_NAV}
        panelTitle="Instructor Panel"
        homeHref="/instructor"
        showRightSidebar
      >
        {children}
      </PanelShell>
    </InstructorGuard>
  )
}

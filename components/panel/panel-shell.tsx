"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { PanelSidebar } from "@/components/panel/panel-sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { DashboardRightSidebar } from "@/components/dashboard/right-sidebar"
import { NotificationPanel } from "@/components/dashboard/notification-panel"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/use-notifications"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { PanelNavGroup } from "@/lib/panel-nav"

interface PanelShellProps {
  children: ReactNode
  nav: PanelNavGroup[]
  panelTitle: string
  homeHref: string
  showRightSidebar?: boolean
  showEmailBanner?: boolean
  showSubscriptionBadge?: boolean
}

export function PanelShell({
  children,
  nav,
  panelTitle,
  homeHref,
  showRightSidebar = false,
  showEmailBanner = false,
  showSubscriptionBadge = false,
}: PanelShellProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false)
  const [subscriptionPlan, setSubscriptionPlan] = useState("FREE")

  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    error: notifError,
    refetch: refetchNotifications,
    handleMarkRead,
    handleMarkAllRead,
    handleDismiss,
  } = useNotifications(!!user)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [user, isLoading, router, pathname])

  useEffect(() => {
    if (!user || !showSubscriptionBadge) return
    api<{ plan: string }>("/subscription/me")
      .then((sub) => setSubscriptionPlan(sub.plan))
      .catch(() => setSubscriptionPlan("FREE"))
  }, [user, showSubscriptionBadge])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardTopbar
        homeHref={homeHref}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={unreadCount}
        plan={subscriptionPlan}
        showSubscriptionBadge={showSubscriptionBadge}
        onNotificationsClick={() => setMobileNotificationsOpen(true)}
      />
      <div className="relative flex flex-1">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-20 mt-16 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 mt-16 transform transition-transform md:relative md:mt-0 md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <PanelSidebar
            nav={nav}
            panelTitle={panelTitle}
            persistKey={homeHref}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {showEmailBanner && <EmailVerificationBanner className="mb-6" />}
          {children}
        </main>
        {showRightSidebar && (
          <DashboardRightSidebar
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={handleDismiss}
            onRetry={refetchNotifications}
            loading={notifLoading}
            error={notifError}
          />
        )}
      </div>

      <Sheet open={mobileNotificationsOpen} onOpenChange={setMobileNotificationsOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={handleDismiss}
            onRetry={refetchNotifications}
            loading={notifLoading}
            error={notifError}
            onClose={() => setMobileNotificationsOpen(false)}
            className="h-full"
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

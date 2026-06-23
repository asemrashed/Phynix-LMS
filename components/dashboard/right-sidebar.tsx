"use client"

import { NotificationPanel } from "@/components/dashboard/notification-panel"
import { cn } from "@/lib/utils"

interface RightSidebarProps {
  notifications?: Parameters<typeof NotificationPanel>[0]["notifications"]
  unreadCount?: number
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onDismiss?: (id: string) => void
  onRetry?: () => void
  loading?: boolean
  error?: string | null
  className?: string
}

export function DashboardRightSidebar({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onRetry,
  loading = false,
  error = null,
  className,
}: RightSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-80 shrink-0 border-l border-border bg-card xl:block",
        className
      )}
    >
      <NotificationPanel
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={onMarkRead ?? (() => {})}
        onMarkAllRead={onMarkAllRead ?? (() => {})}
        onDismiss={onDismiss}
        onRetry={onRetry}
        loading={loading}
        error={error}
        className="h-[calc(100vh-4rem)]"
      />
    </aside>
  )
}

"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationPanel } from "@/components/dashboard/notification-panel"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/use-notifications"

export function NavbarNotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    handleMarkRead,
    handleMarkAllRead,
    handleDismiss,
  } = useNotifications(!!user)

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(calc(100vw-2rem),20rem)] overflow-hidden p-0 sm:w-80"
      >
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onDismiss={handleDismiss}
          onRetry={refetch}
          loading={loading}
          error={error}
          onClose={() => setOpen(false)}
          compact
        />
      </PopoverContent>
    </Popover>
  )
}

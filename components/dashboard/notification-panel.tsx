"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  CreditCard,
  Heart,
  Megaphone,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { NotificationItem } from "@fxprime/types"
import { cn } from "@/lib/utils"

interface NotificationPanelProps {
  notifications: NotificationItem[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDismiss?: (id: string) => void
  onRetry?: () => void
  onClose?: () => void
  className?: string
  compact?: boolean
  loading?: boolean
  error?: string | null
}

function notificationIcon(type: string) {
  switch (type) {
    case "CERTIFICATE_READY":
      return Award
    case "COURSE_REVIEW_REMINDER":
      return Star
    case "CERTIFICATE_REVOKED":
      return ShieldAlert
    case "COURSE_ENROLLED":
      return BookOpen
    case "PAYMENT_COMPLETED":
    case "PAYMENT_FAILED":
    case "PAYMENT_SUCCESS":
    case "PAYMENT_REFUNDED":
    case "ORDER_SHIPPED":
    case "ORDER_DELIVERED":
    case "ORDER_PROCESSING":
    case "ORDER_CANCELLED":
    case "ORDER_RETURNED":
      return CreditCard
    case "COMMUNITY_REACTION":
      return Heart
    case "COMMUNITY_REPLY":
      return MessageSquare
    case "LIVE_SESSION_REGISTERED":
    case "LIVE_SESSION_REMINDER":
    case "LIVE_SESSION_UPDATED":
    case "LIVE_SESSION_RECORDING":
    case "SESSION_CANCELLED":
      return Video
    case "MENTOR_BOOKING":
    case "MENTOR_CANCELLED":
    case "MENTOR_RESCHEDULED":
    case "MENTOR_REMINDER":
      return Calendar
    default:
      return Megaphone
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function toAppPath(link: string): string {
  try {
    const url = new URL(link, typeof window !== "undefined" ? window.location.origin : undefined)
    return url.pathname + url.search + url.hash
  } catch {
    return link
  }
}

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onRetry,
  onClose,
  className,
  compact = false,
  loading = false,
  error = null,
}: NotificationPanelProps) {
  const router = useRouter()

  const handleOpen = (notification: NotificationItem) => {
    if (!notification.isRead) {
      onMarkRead(notification.id)
    }
    if (notification.link) {
      router.push(toAppPath(notification.link))
      onClose?.()
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-popover",
        compact ? "max-h-[min(32rem,calc(100dvh-4rem))]" : "h-full min-h-0",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 rounded-full px-1.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={onMarkAllRead}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea
        className={cn(
          "min-h-0",
          compact
            ? "h-[min(20rem,calc(100dvh-8rem))]"
            : "flex-1",
        )}
      >
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-lg"
                onClick={onRetry}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <Bell className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">All caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New updates will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = notificationIcon(notification.type)
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative px-4 py-3 transition-colors hover:bg-muted/40",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full gap-3 pr-8 text-left"
                    onClick={() => handleOpen(notification)}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        notification.isRead ? "bg-muted" : "bg-primary/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          notification.isRead
                            ? "text-muted-foreground"
                            : "text-primary"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            !notification.isRead && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                  <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMarkRead(notification.id)
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDismiss(notification.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {notification.link && (
                    <Link
                      href={toAppPath(notification.link)}
                      className="sr-only"
                      onClick={() => {
                        if (!notification.isRead) onMarkRead(notification.id)
                      }}
                    >
                      Open
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

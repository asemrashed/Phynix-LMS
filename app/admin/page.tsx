"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AdminStats } from "@fxprime/types"
import { Users, BookOpen, GraduationCap, DollarSign, Flag, RefreshCw } from "lucide-react"
import { AdminStatCard, AdminStatCardSkeleton } from "@/components/admin/admin-stat-card"
import { Button } from "@/components/ui/button"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { formatMoney } from "@/lib/money"
import { getApiErrorMessage } from "@/lib/api-errors"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STAT_COUNT = 5

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    const data = await api<AdminStats>("/admin/stats")
    setStats(data)
  }, [])

  const refresh = useCallback(async () => {
    try {
      await loadStats()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to refresh stats"))
      throw error
    }
  }, [loadStats])

  const { pullDistance, refreshing, pullHandlers, isActive } = usePullToRefresh(refresh)

  useEffect(() => {
    loadStats()
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Failed to load stats"))
        console.error(error)
      })
      .finally(() => setLoading(false))
  }, [loadStats])

  const cards = [
    { label: "Total Students", value: stats?.totalStudents ?? "—", icon: Users, color: "bg-primary/15 text-sidebar-accent-foreground" },
    { label: "Published Courses", value: stats?.publishedCourses ?? "—", icon: BookOpen, color: "bg-blue-50 text-blue-700" },
    { label: "Certificates Issued", value: stats?.totalCertificates ?? "—", icon: GraduationCap, color: "bg-purple-50 text-purple-700" },
    {
      label: "Revenue (Month)",
      value: stats ? formatMoney(stats.revenueMonth) : "—",
      icon: DollarSign,
      color: "bg-sidebar-accent text-sidebar-accent-foreground",
    },
    {
      label: "Reported Posts",
      value: stats?.communityReportedPosts ?? "—",
      icon: Flag,
      color: "bg-orange-50 text-orange-700",
      href: "/admin/community?filter=reported",
    },
  ]

  const showSkeleton = loading && !stats
  const isRefreshing = refreshing && !showSkeleton

  return (
    <div {...pullHandlers}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden transition-[height] duration-200 sm:hidden",
          isActive ? "opacity-100" : "opacity-0"
        )}
        style={{ height: isRefreshing ? 40 : pullDistance }}
        aria-hidden={!isActive}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isRefreshing && "animate-spin",
            !isRefreshing && pullDistance >= 72 && "text-primary"
          )}
        />
      </div>

      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground sm:mb-2 sm:text-2xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Platform overview and management</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-auto sm:px-4"
          onClick={() => void refresh()}
          disabled={loading || refreshing}
          aria-label="Refresh stats"
        >
          <RefreshCw className={cn("h-4 w-4", (loading || refreshing) && "animate-spin")} />
          <span className="hidden sm:ml-2 sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {showSkeleton
          ? Array.from({ length: STAT_COUNT }, (_, i) => (
              <AdminStatCardSkeleton
                key={i}
                className={cn(i === STAT_COUNT - 1 && "col-span-2 sm:col-span-1")}
              />
            ))
          : cards.map((card, index) => (
              <AdminStatCard
                key={card.label}
                {...card}
                className={cn(
                  index === cards.length - 1 && cards.length % 2 !== 0 && "col-span-2 sm:col-span-1"
                )}
              />
            ))}
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { api } from "@/lib/api"
import type {
  AdminStats,
  AdminCourseItem,
  AdminBlogPostItem,
  PaginatedResult,
} from "@fxprime/types"
import { Users, BookOpen, GraduationCap, DollarSign, RefreshCw } from "lucide-react"
import { AdminStatCard, AdminStatCardSkeleton } from "@/components/admin/admin-stat-card"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { formatMoney } from "@/lib/money"
import { getApiErrorMessage } from "@/lib/api-errors"
import { BLOG_COVER_PLACEHOLDER, getBlogCoverUrl, getMediaUrl } from "@/lib/media-url"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STAT_COUNT = 4
const RECENT_LIMIT = 5

const DEFAULT_COURSE_THUMBNAIL =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentCourses, setRecentCourses] = useState<AdminCourseItem[]>([])
  const [recentBlogs, setRecentBlogs] = useState<AdminBlogPostItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadOverview = useCallback(async () => {
    const [statsData, coursesData, blogsData] = await Promise.all([
      api<AdminStats>("/admin/stats"),
      api<PaginatedResult<AdminCourseItem>>(
        `/admin/courses?page=1&pageSize=${RECENT_LIMIT}`
      ),
      api<PaginatedResult<AdminBlogPostItem>>(
        `/admin/blog?page=1&pageSize=${RECENT_LIMIT}`
      ),
    ])
    setStats(statsData)
    setRecentCourses(coursesData.items)
    setRecentBlogs(blogsData.items)
  }, [])

  const refresh = useCallback(async () => {
    try {
      await loadOverview()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to refresh dashboard"))
      throw error
    }
  }, [loadOverview])

  const { pullDistance, refreshing, pullHandlers, isActive } = usePullToRefresh(refresh)

  useEffect(() => {
    loadOverview()
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Failed to load dashboard"))
        console.error(error)
      })
      .finally(() => setLoading(false))
  }, [loadOverview])

  const cards = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? "—",
      icon: Users,
      color: "bg-primary/15 text-sidebar-accent-foreground",
    },
    {
      label: "Published Courses",
      value: stats?.publishedCourses ?? "—",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Certificates Issued",
      value: stats?.totalCertificates ?? "—",
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Revenue (Month)",
      value: stats ? formatMoney(stats.revenueMonth) : "—",
      icon: DollarSign,
      color: "bg-sidebar-accent text-sidebar-accent-foreground",
    },
  ]

  const showStatSkeleton = loading && !stats
  const showTableSkeleton = loading && recentCourses.length === 0 && recentBlogs.length === 0
  const isRefreshing = refreshing && !showStatSkeleton

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
          <h1 className="mb-1 text-xl font-bold text-foreground sm:mb-2 sm:text-2xl">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Platform overview and management
          </p>
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

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
        {showStatSkeleton
          ? Array.from({ length: STAT_COUNT }, (_, i) => <AdminStatCardSkeleton key={i} />)
          : cards.map((card) => <AdminStatCard key={card.label} {...card} />)}
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">Recent Courses</h2>
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link href="/admin/courses">View all</Link>
            </Button>
          </div>
          <AdminDataTable
            loading={showTableSkeleton}
            data={recentCourses}
            rowKey={(course) => course.id}
            emptyMessage="No courses yet."
            columns={[
              {
                key: "title",
                header: "Course",
                cell: (course) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={getMediaUrl(course.thumbnailUrl) || DEFAULT_COURSE_THUMBNAIL}
                      alt=""
                      className="h-12 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ৳{course.price.toLocaleString()} · {course.enrollmentCount} enrolled ·{" "}
                        {course.level}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (course) => <Badge variant="outline">{course.status}</Badge>,
              },
              {
                key: "createdAt",
                header: "Created",
                className: "hidden sm:table-cell",
                cell: (course) => (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(course.createdAt), "MMM d, yyyy")}
                  </span>
                ),
              },
            ]}
            actions={(course) => (
              <Link href={`/admin/course/${course.slug}`}>
                <Button size="sm" variant="outline" className="rounded-xl">
                  Edit
                </Button>
              </Link>
            )}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">Recent Blog Posts</h2>
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link href="/admin/blog">View all</Link>
            </Button>
          </div>
          <AdminDataTable
            loading={showTableSkeleton}
            data={recentBlogs}
            rowKey={(post) => post.id}
            emptyMessage="No blog posts yet."
            columns={[
              {
                key: "title",
                header: "Post",
                cell: (post) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={getBlogCoverUrl(post.coverUrl)}
                      alt=""
                      className="h-12 w-20 shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = BLOG_COVER_PLACEHOLDER
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.category} · /{post.slug}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (post) => (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{post.status}</Badge>
                    {post.isScheduled && <Badge variant="secondary">Scheduled</Badge>}
                  </div>
                ),
              },
              {
                key: "createdAt",
                header: "Created",
                className: "hidden sm:table-cell",
                cell: (post) => (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </span>
                ),
              },
            ]}
            actions={(post) => (
              <Link href={`/admin/blog/${post.id}`}>
                <Button size="sm" variant="outline" className="rounded-xl">
                  Edit
                </Button>
              </Link>
            )}
          />
        </section>
      </div>
    </div>
  )
}

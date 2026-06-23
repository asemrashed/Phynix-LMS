"use client"

import Link from "next/link"
import { BarChart3, BookOpen, Star, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useInstructorAnalytics } from "@/lib/hooks/use-instructor-data"
import {
  InstructorPanelError,
  InstructorPanelLoading,
} from "@/components/instructor/instructor-panel-state"
import { cn } from "@/lib/utils"

export default function InstructorAnalyticsPage() {
  const { data: analytics, loading, error, refetch } = useInstructorAnalytics()

  if (loading) return <InstructorPanelLoading />
  if (error || !analytics) {
    return (
      <InstructorPanelError message={error ?? "Unable to load analytics."} onRetry={refetch} />
    )
  }

  const cards = [
    { label: "Courses", value: analytics.courseCount, icon: BookOpen, color: "bg-blue-50 text-blue-700" },
    { label: "Enrollments", value: analytics.enrollmentCount, icon: Users, color: "bg-primary/15 text-amber-900" },
    { label: "Avg Completion", value: `${analytics.avgCompletionRate}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-700" },
    { label: "Avg Rating", value: analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : "—", icon: Star, color: "bg-amber-50 text-amber-700" },
    { label: "Active Learners", value: analytics.activeLearners, icon: BarChart3, color: "bg-rose-50 text-rose-700" },
    { label: "Published", value: analytics.publishedCount, icon: BookOpen, color: "bg-green-50 text-green-700" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teaching Analytics</h1>
        <p className="text-muted-foreground">Performance across your assigned courses</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[20px] bg-card p-6 shadow-sm">
            <div
              className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", card.color)}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {analytics.recentEnrollments.length > 0 && (
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Recent enrollments</h2>
          <ul className="space-y-3">
            {analytics.recentEnrollments.map((enrollment) => (
              <li
                key={enrollment.enrollmentId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{enrollment.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    <Link
                      href={`/instructor/courses/${enrollment.courseSlug}`}
                      className="hover:text-foreground"
                    >
                      {enrollment.courseTitle}
                    </Link>
                    {" · "}
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Course breakdown</h2>
        {analytics.courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
        ) : (
          <ul className="space-y-3">
            {analytics.courses.map((course) => (
              <li
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <Link
                    href={`/instructor/courses/${course.slug}`}
                    className="font-medium hover:text-primary"
                  >
                    {course.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {course.enrollmentCount} students · {course.avgProgress}% avg progress
                    {course.averageRating > 0 && (
                      <> · {course.averageRating.toFixed(1)} ★ ({course.reviewCount})</>
                    )}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-lg capitalize">
                  {course.status.toLowerCase()}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

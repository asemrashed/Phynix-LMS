"use client"

import Link from "next/link"
import { BookOpen, Star, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInstructorOverview } from "@/lib/hooks/use-instructor-data"
import {
  InstructorPanelError,
  InstructorPanelLoading,
} from "@/components/instructor/instructor-panel-state"
import { cn } from "@/lib/utils"

export default function InstructorDashboardPage() {
  const { data, loading, error, refetch } = useInstructorOverview()

  if (loading) return <InstructorPanelLoading />
  if (error || !data) {
    return <InstructorPanelError message={error ?? "Unable to load dashboard."} onRetry={refetch} />
  }

  const { stats, courses } = data

  const cards = [
    {
      label: "My Courses",
      value: stats.courseCount,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total Enrollments",
      value: stats.enrollmentCount,
      icon: Users,
      color: "bg-primary/15 text-amber-900",
    },
    {
      label: "Avg Completion",
      value: `${stats.avgCompletionRate}%`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Avg Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—",
      icon: Star,
      color: "bg-amber-50 text-amber-700",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instructor Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your courses and track student progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[20px] bg-card p-6 shadow-sm">
            <div
              className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", card.color)}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Courses</h2>
          <Link href="/instructor/courses">
            <Button variant="outline" className="rounded-xl">
              View All
            </Button>
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No courses assigned yet. Ask an admin to assign you as instructor.
          </p>
        ) : (
          <ul className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <li key={course.id}>
                <Link
                  href={`/instructor/courses/${course.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.enrollmentCount} students · {course.status.toLowerCase()}
                    </p>
                  </div>
                  <span className="text-xs uppercase text-muted-foreground">{course.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[20px] bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Teaching insights</h2>
          <Link href="/instructor/analytics">
            <Button variant="outline" className="rounded-xl">
              Full Analytics
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Published courses</p>
            <p className="mt-1 text-lg font-semibold">{stats.publishedCount}</p>
          </div>
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Active learners</p>
            <p className="mt-1 text-lg font-semibold">{stats.activeLearners}</p>
          </div>
          <div className="rounded-xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Draft courses</p>
            <p className="mt-1 text-lg font-semibold">
              {stats.courseCount - stats.publishedCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

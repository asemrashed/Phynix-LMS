"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { StudentAnalytics } from "@fxprime/types"
import { BarChart3, BookOpen, Package, Trophy } from "lucide-react"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<StudentAnalytics>("/analytics/me")
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Loading...</p>
  if (!analytics) return <p className="text-muted-foreground">Unable to load analytics.</p>

  const maxHours = Math.max(...analytics.weeklyActivity.map((d) => d.hours), 1)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Learning Analytics</h1>
        <p className="text-muted-foreground">Track your progress and study habits</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lessons Completed", value: analytics.totalLessonsCompleted, icon: BookOpen },
          { label: "Courses Enrolled", value: analytics.coursesEnrolled, icon: BarChart3 },
          { label: "Courses Completed", value: analytics.coursesCompleted, icon: Trophy },
          { label: "Products Owned", value: analytics.productsPurchased, icon: Package },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[20px] bg-card p-6 shadow-sm">
            <stat.icon className="mb-2 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Weekly Activity (hours)</h2>
        <div className="flex items-end gap-2 h-32">
          {analytics.weeklyActivity.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg bg-primary/80 transition-all"
                style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: day.hours > 0 ? "4px" : "2px" }}
              />
              <span className="text-[10px] text-muted-foreground">
                {day.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {analytics.courseProgress.length > 0 && (
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Course Progress</h2>
          <div className="space-y-3">
            {analytics.courseProgress.map((c) => (
              <div key={c.courseTitle}>
                <div className="flex justify-between text-sm">
                  <span>{c.courseTitle}</span>
                  <span className="text-muted-foreground">{c.progress}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

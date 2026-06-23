"use client"

import { Flame, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { LearningGoals } from "@fxprime/types"
import { cn } from "@/lib/utils"

interface LearningStreakWidgetProps {
  goals: LearningGoals | null
  loading?: boolean
  className?: string
}

function dayLabel(dateStr: string): string {
  const labels = ["S", "M", "T", "W", "T", "F", "S"]
  return labels[new Date(`${dateStr}T12:00:00`).getDay()]
}

export function LearningStreakWidget({
  goals,
  loading,
  className,
}: LearningStreakWidgetProps) {
  if (loading) {
    return (
      <div className={cn("h-48 animate-pulse rounded-[20px] bg-muted", className)} />
    )
  }

  if (!goals) return null

  const weeklyPercent = Math.min(
    100,
    Math.round((goals.weeklyProgressHours / goals.weeklyGoalHours) * 100)
  )

  return (
    <div className={cn("rounded-[20px] bg-card p-6 shadow-sm", className)}>
      <h2 className="mb-4 text-xl font-bold text-foreground">Learning Goals</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Current Streak
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {goals.currentStreak}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              {goals.currentStreak === 1 ? "day" : "days"}
            </span>
          </p>
          {goals.longestStreak > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Best: {goals.longestStreak} days
            </p>
          )}
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Weekly Goal
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {goals.weeklyProgressHours}
            <span className="text-base font-normal text-muted-foreground">
              /{goals.weeklyGoalHours}h
            </span>
          </p>
          <Progress value={weeklyPercent} className="mt-3 h-2" />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Last 7 days
        </p>
        <div className="flex justify-between gap-1">
          {goals.weeklyActivity.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-full max-w-[36px] items-end justify-center rounded-lg transition-colors",
                  day.active ? "bg-primary/20" : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "w-4 rounded-t-md",
                    day.active ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                  style={{
                    height: day.active
                      ? `${Math.max(20, Math.min(100, day.minutes * 2))}%`
                      : "20%",
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {dayLabel(day.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

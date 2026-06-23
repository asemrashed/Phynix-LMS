"use client"

import type { QuizLessonContent } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"

interface QuizHeaderProps {
  content: QuizLessonContent
  attemptsUsed: number
  attemptsRemaining: number
  timeRemainingSeconds?: number | null
}

export function QuizHeader({
  content,
  attemptsUsed,
  attemptsRemaining,
  timeRemainingSeconds,
}: QuizHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">Quiz</h3>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Pass: {content.passThreshold}%</Badge>
        <Badge variant="secondary">
          Attempts: {attemptsUsed}/{content.maxAttempts}
        </Badge>
        {attemptsRemaining === 0 && (
          <Badge variant="destructive">No attempts left</Badge>
        )}
        {timeRemainingSeconds != null && timeRemainingSeconds > 0 && (
          <Badge variant="outline">
            Time: {Math.floor(timeRemainingSeconds / 60)}:
            {String(timeRemainingSeconds % 60).padStart(2, "0")}
          </Badge>
        )}
      </div>
    </div>
  )
}

"use client"

import { Progress } from "@/components/ui/progress"

interface QuizProgressProps {
  answered: number
  total: number
}

export function QuizProgress({ answered, total }: QuizProgressProps) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {answered} of {total} answered
        </span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  )
}

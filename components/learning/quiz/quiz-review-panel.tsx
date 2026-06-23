"use client"

import type { QuizLessonContent } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface QuizReviewPanelProps {
  content: QuizLessonContent
  score: number | null
}

export function QuizReviewPanel({ content, score }: QuizReviewPanelProps) {
  const review = content.review

  return (
    <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Quiz passed!</h3>
        {(score ?? review?.score) != null && (
          <Badge variant="outline">Score: {score ?? review?.score}%</Badge>
        )}
      </div>

      {review && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Review your answers</p>
          {content.questions.map((question, idx) => {
            const result = review.results.find((r) => r.questionId === question.id)
            const studentAnswer = review.answers?.[question.id]
            return (
              <div
                key={question.id}
                className={cn(
                  "space-y-2 rounded-xl border p-4",
                  result?.correct ? "border-primary/30" : "border-destructive/30"
                )}
              >
                <p className="font-medium">
                  {idx + 1}. {question.question}
                </p>
                <div className="space-y-1 text-sm">
                  {question.options.map((opt, optIdx) => {
                    const isSelected = studentAnswer === optIdx
                    const isCorrect = result?.correctIndex === optIdx
                    return (
                      <p
                        key={optIdx}
                        className={cn(
                          "rounded-lg px-2 py-1",
                          isCorrect && "bg-primary/10 font-medium text-primary",
                          isSelected && !isCorrect && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {opt}
                        {isSelected && " (your answer)"}
                        {isCorrect && " (correct)"}
                      </p>
                    )
                  })}
                </div>
                {question.explanation && (
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

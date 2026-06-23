"use client"

import type { LessonProgressResult, QuizLessonContent } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react"

interface QuizResultPanelProps {
  content: QuizLessonContent
  result: LessonProgressResult
  onRetry?: () => void
}

export function QuizResultPanel({ content, result, onRetry }: QuizResultPanelProps) {
  const passed = result.quizPassed === true
  const score = result.quizScore ?? 0
  const canRetry =
    !passed &&
    (result.quizAttemptsRemaining ?? 0) > 0 &&
    typeof onRetry === "function"

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl p-4",
          passed ? "bg-primary/10" : "bg-destructive/10"
        )}
      >
        {passed ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        )}
        <div>
          <p className="font-semibold">
            {passed ? "Quiz passed!" : "Quiz not passed"}
          </p>
          <p className="text-sm text-muted-foreground">
            Score: {score}% — need {content.passThreshold}% to pass
          </p>
          {result.quizAttemptsRemaining != null && (
            <p className="text-sm text-muted-foreground">
              {result.quizAttemptsRemaining > 0
                ? `${result.quizAttemptsRemaining} attempt(s) remaining`
                : "No attempts remaining"}
            </p>
          )}
        </div>
      </div>

      {!passed && result.quizPerQuestion && result.quizPerQuestion.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Question feedback</p>
          {result.quizPerQuestion.map((item) => {
            const question = content.questions.find((q) => q.id === item.questionId)
            return (
              <div
                key={item.questionId}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm",
                  item.correct ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
                )}
              >
                <p className="font-medium">{question?.question ?? "Question"}</p>
                <p className={item.correct ? "text-primary" : "text-destructive"}>
                  {item.correct ? "Correct" : "Incorrect"}
                </p>
                {item.explanation && (
                  <p className="mt-1 text-muted-foreground">{item.explanation}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {canRetry && (
        <Button variant="outline" className="rounded-xl w-full" onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}

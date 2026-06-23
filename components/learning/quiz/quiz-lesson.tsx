"use client"

import { useState } from "react"
import type { LessonProgressResult, QuizLessonContent } from "@fxprime/types"
import { QuizHeader } from "./quiz-header"
import { QuizProgress } from "./quiz-progress"
import { QuizQuestionRenderer } from "./quiz-question-renderer"
import { QuizSubmitBar } from "./quiz-submit-bar"
import { QuizResultPanel } from "./quiz-result-panel"
import { QuizReviewPanel } from "./quiz-review-panel"
import { useQuizAttempt, useQuizTimer } from "./hooks/use-quiz-attempt"

interface QuizLessonProps {
  content: QuizLessonContent
  isCompleted: boolean
  previousScore: number | null
  attemptsUsed: number
  attemptsRemaining: number
  onSubmit: (answers: Record<string, number>) => Promise<LessonProgressResult>
  saving?: boolean
}

export function QuizLesson({
  content,
  isCompleted,
  previousScore,
  attemptsUsed,
  attemptsRemaining,
  onSubmit,
  saving,
}: QuizLessonProps) {
  const {
    questions,
    displayAnswers,
    setAnswer,
    getSubmitAnswers,
    allAnswered,
    answeredCount,
    showResult,
    setShowResult,
    resetAttempt,
  } = useQuizAttempt(content)

  const [lastResult, setLastResult] = useState<LessonProgressResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timerActive = !isCompleted && !showResult && attemptsRemaining > 0
  const timeRemaining = useQuizTimer(content.timeLimitSeconds, timerActive)

  if (isCompleted) {
    return <QuizReviewPanel content={content} score={previousScore} />
  }

  const handleSubmit = async () => {
    setError(null)
    try {
      const result = await onSubmit(getSubmitAnswers())
      setLastResult(result)
      setShowResult(true)
    } catch (err) {
      const apiErr = err as { message?: string }
      setError(apiErr.message || "Failed to submit quiz")
    }
  }

  if (showResult && lastResult) {
    return (
      <div className="rounded-[20px] bg-card p-6 shadow-sm space-y-4">
        <QuizResultPanel
          content={content}
          result={lastResult}
          onRetry={
            (lastResult.quizAttemptsRemaining ?? 0) > 0 && !lastResult.quizPassed
              ? resetAttempt
              : undefined
          }
        />
      </div>
    )
  }

  const canSubmit =
    allAnswered &&
    attemptsRemaining > 0 &&
    (timeRemaining == null || timeRemaining > 0)

  return (
    <div className="rounded-[20px] bg-card p-6 shadow-sm space-y-6">
      <QuizHeader
        content={content}
        attemptsUsed={attemptsUsed}
        attemptsRemaining={attemptsRemaining}
        timeRemainingSeconds={timeRemaining}
      />

      <QuizProgress answered={answeredCount} total={questions.length} />

      {attemptsRemaining === 0 ? (
        <p className="text-sm text-destructive">
          You have used all {content.maxAttempts} attempts. Contact your instructor if you
          need help.
        </p>
      ) : (
        <>
          {questions.map((q, idx) => (
            <QuizQuestionRenderer
              key={q.id}
              question={q}
              index={idx}
              value={displayAnswers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
            />
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <QuizSubmitBar disabled={!canSubmit} saving={saving} onSubmit={handleSubmit} />
        </>
      )}
    </div>
  )
}

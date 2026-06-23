"use client"

import { useEffect, useMemo, useState } from "react"
import type { QuizLessonContent, QuizQuestionItem } from "@fxprime/types"

type DisplayQuestion = QuizQuestionItem & {
  /** Maps displayed option index → original option index */
  optionIndexMap?: number[]
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function useQuizTimer(timeLimitSeconds?: number, active = true) {
  const [remaining, setRemaining] = useState<number | null>(
    timeLimitSeconds ? timeLimitSeconds : null
  )

  useEffect(() => {
    if (!timeLimitSeconds || !active) {
      setRemaining(timeLimitSeconds ?? null)
      return
    }

    setRemaining(timeLimitSeconds)
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev == null || prev <= 1) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLimitSeconds, active])

  return remaining
}

function buildDisplayQuestions(content: QuizLessonContent): DisplayQuestion[] {
  let questions: DisplayQuestion[] = [...content.questions]

  if (content.shuffleQuestions) {
    questions = shuffleArray(questions)
  }

  if (content.shuffleOptions) {
    questions = questions.map((q) => {
      if (q.type === "TRUE_FALSE") return q
      const indexed = q.options.map((opt, i) => ({ opt, i }))
      const shuffled = shuffleArray(indexed)
      return {
        ...q,
        options: shuffled.map((x) => x.opt),
        optionIndexMap: shuffled.map((x) => x.i),
      }
    })
  }

  return questions
}

export function useQuizAttempt(content: QuizLessonContent) {
  const questions = useMemo(() => buildDisplayQuestions(content), [content])
  const [displayAnswers, setDisplayAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(false)

  const allAnswered = questions.every((q) => displayAnswers[q.id] !== undefined)
  const answeredCount = questions.filter((q) => displayAnswers[q.id] !== undefined).length

  const getSubmitAnswers = (): Record<string, number> => {
    const mapped: Record<string, number> = {}
    for (const q of questions) {
      const displayIdx = displayAnswers[q.id]
      if (displayIdx === undefined) continue
      mapped[q.id] = q.optionIndexMap?.[displayIdx] ?? displayIdx
    }
    return mapped
  }

  const setAnswer = (questionId: string, displayIndex: number) => {
    setDisplayAnswers((prev) => ({ ...prev, [questionId]: displayIndex }))
  }

  const resetAttempt = () => {
    setDisplayAnswers({})
    setShowResult(false)
  }

  return {
    questions,
    displayAnswers,
    setAnswer,
    getSubmitAnswers,
    allAnswered,
    answeredCount,
    showResult,
    setShowResult,
    resetAttempt,
  }
}

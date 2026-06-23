import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { QuizContentStored, QuizQuestionStored } from "@fxprime/types"
import { parseQuizContent, quizContentSchema } from "@fxprime/types"

function newQuestionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyQuestion(type: "SINGLE_CHOICE" | "TRUE_FALSE" = "SINGLE_CHOICE"): QuizQuestionStored {
  return {
    id: newQuestionId(),
    type,
    question: "",
    options: type === "TRUE_FALSE" ? ["True", "False"] : ["", ""],
    correctIndex: 0,
  }
}

export function createEmptyQuiz(): QuizContentStored {
  return {
    passThreshold: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    questions: [createEmptyQuestion()],
  }
}

export function parseQuizJson(raw: string | null | undefined): QuizContentStored {
  if (!raw?.trim()) return createEmptyQuiz()
  const parsed = parseQuizContent(raw)
  if (parsed.questions.length === 0) return createEmptyQuiz()
  return parsed
}

export function serializeQuiz(content: QuizContentStored): string {
  return JSON.stringify(content, null, 2)
}

export function useQuizContent(
  raw: string | null | undefined,
  onChange: (json: string) => void
) {
  const [content, setContent] = useState<QuizContentStored>(() => parseQuizJson(raw))
  const [parseError, setParseError] = useState<string | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!raw?.trim()) {
      const empty = createEmptyQuiz()
      setContent(empty)
      onChangeRef.current(serializeQuiz(empty))
    }
  }, [raw])

  const validation = useMemo(() => quizContentSchema.safeParse(content), [content])

  const commit = useCallback(
    (next: QuizContentStored) => {
      setContent(next)
      setParseError(null)
      onChange(serializeQuiz(next))
    },
    [onChange]
  )

  const updateSettings = useCallback(
    (patch: Partial<Omit<QuizContentStored, "questions">>) => {
      commit({ ...content, ...patch })
    },
    [commit, content]
  )

  const addQuestion = useCallback(
    (type: "SINGLE_CHOICE" | "TRUE_FALSE" = "SINGLE_CHOICE") => {
      commit({
        ...content,
        questions: [...content.questions, createEmptyQuestion(type)],
      })
    },
    [commit, content]
  )

  const updateQuestion = useCallback(
    (id: string, patch: Partial<QuizQuestionStored>) => {
      commit({
        ...content,
        questions: content.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      })
    },
    [commit, content]
  )

  const removeQuestion = useCallback(
    (id: string) => {
      const next = content.questions.filter((q) => q.id !== id)
      commit({
        ...content,
        questions: next.length ? next : [createEmptyQuestion()],
      })
    },
    [commit, content]
  )

  const moveQuestion = useCallback(
    (id: string, direction: "up" | "down") => {
      const idx = content.questions.findIndex((q) => q.id === id)
      if (idx < 0) return
      const target = direction === "up" ? idx - 1 : idx + 1
      if (target < 0 || target >= content.questions.length) return
      const questions = [...content.questions]
      ;[questions[idx], questions[target]] = [questions[target], questions[idx]]
      commit({ ...content, questions })
    },
    [commit, content]
  )

  return {
    content,
    validation,
    parseError,
    setParseError,
    commit,
    updateSettings,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
  }
}

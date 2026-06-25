"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuizQuestionList } from "./quiz-question-list"
import { QuizSettingsForm } from "./quiz-settings-form"
import { useQuizContent } from "./hooks/use-quiz-content"

interface QuizLessonEditorProps {
  value: string | null | undefined
  onChange: (json: string) => void
}

export function QuizLessonEditor({ value, onChange }: QuizLessonEditorProps) {
  const {
    content,
    validation,
    updateSettings,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
  } = useQuizContent(value, onChange)

  const { passThreshold, questions } = content

  return (
    <div className="space-y-4">
      <QuizSettingsForm
        settings={{ passThreshold, maxAttempts: content.maxAttempts, shuffleQuestions: false, shuffleOptions: false }}
        onChange={updateSettings}
      />

      <QuizQuestionList
        questions={questions}
        onAdd={addQuestion}
        onUpdate={updateQuestion}
        onRemove={removeQuestion}
        onMove={moveQuestion}
      />

      {!validation.success && (
        <Alert variant="destructive">
          <AlertDescription>
            {validation.error.issues.map((issue) => issue.message).join(" · ")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

"use client"

import type { QuizQuestionStored } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { QuizQuestionCard } from "./quiz-question-card"

interface QuizQuestionListProps {
  questions: QuizQuestionStored[]
  onAdd: (type?: "SINGLE_CHOICE" | "TRUE_FALSE") => void
  onUpdate: (id: string, patch: Partial<QuizQuestionStored>) => void
  onRemove: (id: string) => void
  onMove: (id: string, direction: "up" | "down") => void
}

export function QuizQuestionList({
  questions,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: QuizQuestionListProps) {
  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <QuizQuestionCard
          key={question.id}
          question={question}
          index={index}
          total={questions.length}
          onChange={(patch) => onUpdate(question.id, patch)}
          onRemove={() => onRemove(question.id)}
          onMove={(direction) => onMove(question.id, direction)}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => onAdd("SINGLE_CHOICE")}
        >
          <Plus className="mr-1.5 size-3.5" />
          Add question
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => onAdd("TRUE_FALSE")}
        >
          <Plus className="mr-1.5 size-3.5" />
          Add true/false
        </Button>
      </div>
    </div>
  )
}

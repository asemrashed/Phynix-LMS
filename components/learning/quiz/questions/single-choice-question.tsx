"use client"

import type { QuizQuestionItem } from "@fxprime/types"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SingleChoiceQuestionProps {
  question: QuizQuestionItem
  index: number
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function SingleChoiceQuestion({
  question,
  index,
  value,
  onChange,
  disabled,
}: SingleChoiceQuestionProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <p className="font-medium">
        {index + 1}. {question.question}
      </p>
      <RadioGroup
        value={value?.toString()}
        onValueChange={(v) => onChange(Number(v))}
        disabled={disabled}
      >
        {question.options.map((opt, optIdx) => (
          <div key={optIdx} className="flex items-center gap-2">
            <RadioGroupItem value={String(optIdx)} id={`${question.id}-${optIdx}`} />
            <Label
              htmlFor={`${question.id}-${optIdx}`}
              className="font-normal cursor-pointer"
            >
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

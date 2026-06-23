"use client"

import type { QuizQuestionItem } from "@fxprime/types"
import { SingleChoiceQuestion } from "./questions/single-choice-question"

interface QuizQuestionRendererProps {
  question: QuizQuestionItem
  index: number
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function QuizQuestionRenderer(props: QuizQuestionRendererProps) {
  return <SingleChoiceQuestion {...props} />
}

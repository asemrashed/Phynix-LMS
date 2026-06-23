"use client"

import type { QuizQuestionStored } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"

interface QuizQuestionCardProps {
  question: QuizQuestionStored
  index: number
  total: number
  onChange: (patch: Partial<QuizQuestionStored>) => void
  onRemove: () => void
  onMove: (direction: "up" | "down") => void
}

export function QuizQuestionCard({
  question,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: QuizQuestionCardProps) {
  const isTrueFalse = question.type === "TRUE_FALSE"

  const setType = (type: "SINGLE_CHOICE" | "TRUE_FALSE") => {
    if (type === "TRUE_FALSE") {
      onChange({
        type,
        options: ["True", "False"],
        correctIndex: Math.min(question.correctIndex, 1),
      })
      return
    }
    onChange({
      type,
      options: question.options.length >= 2 ? question.options : ["", ""],
      correctIndex: Math.min(question.correctIndex, Math.max(question.options.length - 1, 0)),
    })
  }

  const updateOption = (optIdx: number, value: string) => {
    const options = [...question.options]
    options[optIdx] = value
    onChange({ options })
  }

  const addOption = () => {
    onChange({ options: [...question.options, ""] })
  }

  const removeOption = (optIdx: number) => {
    if (question.options.length <= 2) return
    const options = question.options.filter((_, i) => i !== optIdx)
    let correctIndex = question.correctIndex
    if (optIdx === correctIndex) correctIndex = 0
    else if (optIdx < correctIndex) correctIndex -= 1
    onChange({ options, correctIndex })
  }

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">Question {index + 1}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            disabled={index === 0}
            onClick={() => onMove("up")}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            disabled={index === total - 1}
            onClick={() => onMove("down")}
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Question</Label>
          <Textarea
            className="min-h-[72px] rounded-xl"
            placeholder="Enter the question"
            value={question.question}
            onChange={(e) => onChange({ question: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={question.type} onValueChange={(v) => setType(v as typeof question.type)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SINGLE_CHOICE">Multiple choice</SelectItem>
              <SelectItem value="TRUE_FALSE">True / False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Options — click checkmark to mark correct</Label>
        {question.options.map((opt, optIdx) => (
          <div key={optIdx} className="flex items-center gap-2">
            <Button
              type="button"
              variant={question.correctIndex === optIdx ? "default" : "outline"}
              size="icon"
              className={cn("size-8 shrink-0 rounded-lg")}
              onClick={() => onChange({ correctIndex: optIdx })}
              title="Mark as correct"
            >
              <Check className="size-4" />
            </Button>
            <Input
              className="rounded-xl"
              placeholder={`Option ${optIdx + 1}`}
              value={isTrueFalse ? opt : opt}
              disabled={isTrueFalse}
              onChange={(e) => updateOption(optIdx, e.target.value)}
            />
            {!isTrueFalse && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg"
                disabled={question.options.length <= 2}
                onClick={() => removeOption(optIdx)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
        {!isTrueFalse && (
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addOption}>
            <Plus className="mr-1.5 size-3.5" />
            Add option
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Explanation (optional)</Label>
        <Textarea
          className="min-h-[60px] rounded-xl"
          placeholder="Shown after the student answers"
          value={question.explanation ?? ""}
          onChange={(e) => onChange({ explanation: e.target.value || undefined })}
        />
      </div>
    </div>
  )
}

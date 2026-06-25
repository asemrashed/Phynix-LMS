"use client"

import type { QuizContentStored } from "@fxprime/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QuizSettingsFormProps {
  settings: Omit<QuizContentStored, "questions">
  onChange: (patch: Partial<Omit<QuizContentStored, "questions">>) => void
}

export function QuizSettingsForm({ settings, onChange }: QuizSettingsFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="quiz-pass-threshold">Pass threshold (%)</Label>
      <Input
        id="quiz-pass-threshold"
        type="number"
        min={0}
        max={100}
        className="rounded-xl"
        value={settings.passThreshold}
        onChange={(e) =>
          onChange({ passThreshold: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
        }
      />
    </div>
  )
}

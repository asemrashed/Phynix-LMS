"use client"

import type { QuizContentStored } from "@fxprime/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface QuizSettingsFormProps {
  settings: Omit<QuizContentStored, "questions">
  onChange: (patch: Partial<Omit<QuizContentStored, "questions">>) => void
}

export function QuizSettingsForm({ settings, onChange }: QuizSettingsFormProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
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
      <div className="space-y-2">
        <Label htmlFor="quiz-max-attempts">Max attempts</Label>
        <Input
          id="quiz-max-attempts"
          type="number"
          min={1}
          className="rounded-xl"
          value={settings.maxAttempts}
          onChange={(e) =>
            onChange({ maxAttempts: Math.max(1, Number(e.target.value) || 1) })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quiz-time-limit">Time limit (minutes, optional)</Label>
        <Input
          id="quiz-time-limit"
          type="number"
          min={0}
          className="rounded-xl"
          placeholder="No limit"
          value={
            settings.timeLimitSeconds ? Math.round(settings.timeLimitSeconds / 60) : ""
          }
          onChange={(e) => {
            const minutes = Number(e.target.value)
            onChange({
              timeLimitSeconds:
                e.target.value === "" || minutes <= 0 ? undefined : minutes * 60,
            })
          }}
        />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border px-3 py-2 sm:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="quiz-shuffle-questions">Shuffle questions</Label>
            <p className="text-xs text-muted-foreground">Random order for each student</p>
          </div>
          <Switch
            id="quiz-shuffle-questions"
            checked={settings.shuffleQuestions}
            onCheckedChange={(v) => onChange({ shuffleQuestions: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="quiz-shuffle-options">Shuffle options</Label>
            <p className="text-xs text-muted-foreground">Randomize answer order</p>
          </div>
          <Switch
            id="quiz-shuffle-options"
            checked={settings.shuffleOptions}
            onCheckedChange={(v) => onChange({ shuffleOptions: v })}
          />
        </div>
      </div>
    </div>
  )
}

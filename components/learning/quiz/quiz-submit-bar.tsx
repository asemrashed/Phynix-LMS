"use client"

import { Button } from "@/components/ui/button"

interface QuizSubmitBarProps {
  disabled: boolean
  saving?: boolean
  onSubmit: () => void
}

export function QuizSubmitBar({ disabled, saving, onSubmit }: QuizSubmitBarProps) {
  return (
    <Button className="rounded-xl w-full" disabled={disabled || saving} onClick={onSubmit}>
      {saving ? "Submitting…" : "Submit quiz"}
    </Button>
  )
}

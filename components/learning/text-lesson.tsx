"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface TextLessonProps {
  html: string
  isCompleted: boolean
  onComplete: () => void
  saving?: boolean
}

export function TextLesson({ html, isCompleted, onComplete, saving }: TextLessonProps) {
  return (
    <div className="rounded-[20px] bg-card p-6 shadow-sm">
      <div
        className="prose prose-sm max-w-none dark:prose-invert [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {!isCompleted && (
        <Button className="mt-6 rounded-xl" onClick={onComplete} disabled={saving}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Mark as read"}
        </Button>
      )}
    </div>
  )
}

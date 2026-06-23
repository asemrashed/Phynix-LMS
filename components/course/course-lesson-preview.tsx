"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { LessonItem, VideoTokenResponse } from "@fxprime/types"
import { api } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

const CourseVideoPlayer = dynamic(
  () =>
    import("@/components/course-video-player").then((m) => m.CourseVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    ),
  }
)

interface CourseLessonPreviewProps {
  courseId: string
  lesson: LessonItem
  className?: string
}

export function CourseLessonPreview({
  courseId,
  lesson,
  className,
}: CourseLessonPreviewProps) {
  const [playback, setPlayback] = useState<VideoTokenResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPreview() {
      setLoading(true)
      setError(null)
      setPlayback(null)
      try {
        const token = await api<VideoTokenResponse>(
          `/courses/${courseId}/lessons/${lesson.id}/preview`
        )
        if (!cancelled) setPlayback(token)
      } catch {
        if (!cancelled) setError("Preview unavailable for this lesson.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (lesson.type === "VIDEO" && lesson.isFree) {
      loadPreview()
    } else {
      setLoading(false)
      setError("Preview unavailable for this lesson.")
    }

    return () => {
      cancelled = true
    }
  }, [courseId, lesson.id, lesson.isFree, lesson.type])

  if (loading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !playback) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted px-6 text-center text-sm text-muted-foreground">
        {error ?? "Preview unavailable"}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="outline">Free Preview</Badge>
        <span className="text-sm font-medium text-foreground">{lesson.title}</span>
      </div>
      <CourseVideoPlayer
        playback={playback}
        watermarkText="IELTS LMS · Preview"
      />
    </div>
  )
}

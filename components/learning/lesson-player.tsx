"use client"

import dynamic from "next/dynamic"
import { TextLesson } from "@/components/learning/text-lesson"
import { QuizLesson } from "@/components/learning/quiz/quiz-lesson"
import type {
  LessonItem,
  LessonProgressResult,
  QuizLessonContent,
  StudentLessonDetail,
  VideoTokenResponse,
} from "@fxprime/types"
import { api } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import { useCallback, useRef } from "react"

const VideoPlayer = dynamic(
  () => import("@/components/course-video-player").then((m) => m.CourseVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    ),
  }
)

interface LessonPlayerProps {
  courseId: string
  lesson: LessonItem
  lessonDetail: StudentLessonDetail | null
  videoToken: VideoTokenResponse | null
  watermarkText: string
  loading: boolean
  saving: boolean
  onProgress: (result: LessonProgressResult) => void
  onLessonReload: () => void
}

export function LessonPlayer({
  courseId,
  lesson,
  lessonDetail,
  videoToken,
  watermarkText,
  loading,
  saving,
  onProgress,
  onLessonReload,
}: LessonPlayerProps) {
  const progressSavingRef = useRef(false)

  const submitProgress = async (body: Record<string, unknown>, reload = true) => {
    const result = await api<LessonProgressResult>(
      `/courses/${courseId}/lessons/${lesson.id}/progress`,
      { method: "POST", body: JSON.stringify(body) }
    )
    onProgress(result)
    if (reload) onLessonReload()
    return result
  }

  const handleWatchProgress = useCallback(
    async (position: number, completed?: boolean) => {
      if (progressSavingRef.current) return
      progressSavingRef.current = true
      try {
        const body: Record<string, unknown> = { watchPosition: position }
        if (completed) body.isCompleted = true
        const result = await api<LessonProgressResult>(
          `/courses/${courseId}/lessons/${lesson.id}/progress`,
          { method: "POST", body: JSON.stringify(body) }
        )
        onProgress(result)
      } catch {
        // progress save failed silently
      } finally {
        progressSavingRef.current = false
      }
    },
    [courseId, lesson.id, onProgress]
  )

  if (loading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (lesson.type === "VIDEO" && videoToken) {
    return (
      <VideoPlayer
        playback={videoToken}
        courseId={courseId}
        lessonId={lesson.id}
        watermarkText={watermarkText}
        onWatchProgress={handleWatchProgress}
      />
    )
  }

  if (!lessonDetail) return null

  if (lesson.type === "TEXT" && "html" in lessonDetail.content) {
    return (
      <TextLesson
        html={lessonDetail.content.html}
        isCompleted={lessonDetail.isCompleted}
        saving={saving}
        onComplete={() => submitProgress({ isCompleted: true })}
      />
    )
  }

  if (lesson.type === "QUIZ" && "questions" in lessonDetail.content) {
    return (
      <QuizLesson
        content={lessonDetail.content as QuizLessonContent}
        isCompleted={lessonDetail.isCompleted}
        previousScore={lessonDetail.quizScore}
        attemptsUsed={lessonDetail.quizAttemptsUsed}
        attemptsRemaining={lessonDetail.quizAttemptsRemaining}
        saving={saving}
        onSubmit={async (answers) => {
          const result = await submitProgress({ quizAnswers: answers }, false)
          if (result.quizPassed) {
            onLessonReload()
          }
          return result
        }}
      />
    )
  }

  return (
    <div className="rounded-[20px] bg-card p-6 text-muted-foreground">
      Unsupported lesson type.
    </div>
  )
}

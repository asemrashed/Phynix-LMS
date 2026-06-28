"use client"

import dynamic from "next/dynamic"
import type { AdminLessonItem } from "@fxprime/types"
import { getLessonVideoRef } from "@/lib/video-source"
import { CourseLessonPreview } from "@/components/course/course-lesson-preview"
import { Badge } from "@/components/ui/badge"

const CourseVideoPlayer = dynamic(
  () =>
    import("@/components/course-video-player").then((m) => m.CourseVideoPlayer),
  { ssr: false }
)

interface AdminLessonVideoPreviewProps {
  courseId: string
  lesson: AdminLessonItem
}

export function AdminLessonVideoPreview({
  courseId,
  lesson,
}: AdminLessonVideoPreviewProps) {
  const { provider, ref } = getLessonVideoRef(lesson)

  if (!ref) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
        Add a YouTube link or upload a video file above to preview playback.
      </p>
    )
  }

  if (provider === "YOUTUBE") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            Admin preview
          </Badge>
          <span className="text-xs text-muted-foreground">YouTube lesson</span>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl border bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ref}`}
            title={`YouTube preview: ${lesson.title}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  if (lesson.isFree) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            Student preview
          </Badge>
          <span className="text-xs text-muted-foreground">
            How enrolled visitors see this free lesson
          </span>
        </div>
        <CourseLessonPreview
          courseId={courseId}
          lesson={{
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            order: lesson.order,
            isFree: lesson.isFree,
          }}
        />
      </div>
    )
  }

  return (
    <p className="rounded-xl border bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
      Enable &quot;Free preview&quot; to test the student video player, or preview after
      publishing from the course page.
    </p>
  )
}

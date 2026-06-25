"use client"

import dynamic from "next/dynamic"
import type { AdminLessonItem, VideoProvider } from "@fxprime/types"
import { getLessonVideoRef } from "@/lib/video-source"
import { CourseLessonPreview } from "@/components/course/course-lesson-preview"
import { Badge } from "@/components/ui/badge"

const CourseVideoPlayer = dynamic(
  () =>
    import("@/components/course-video-player").then((m) => m.CourseVideoPlayer),
  { ssr: false }
)

function buildEmbedUrl(provider: VideoProvider, ref: string): string | null {
  if (provider === "YOUTUBE") {
    return `https://www.youtube.com/embed/${ref}`
  }
  return null
}

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
        Add a video source above to preview playback.
      </p>
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

  const embedUrl = buildEmbedUrl(provider, ref)
  if (!embedUrl) {
    return (
      <p className="rounded-xl border bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
        Uploaded videos can be previewed after publish. Enable &quot;Free preview&quot; to test
        the student embed flow.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">
          Admin embed
        </Badge>
        <span className="text-xs text-muted-foreground">Locked lesson — direct embed preview</span>
      </div>
      <CourseVideoPlayer
        playback={{
          provider,
          embedUrl,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          watchPosition: 0,
          duration: lesson.duration,
          sessionToken: "admin-preview",
          isCompleted: false,
        }}
        watermarkText="IELTS LMS · Admin Preview"
      />
    </div>
  )
}

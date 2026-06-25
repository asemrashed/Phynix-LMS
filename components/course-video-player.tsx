"use client"

import dynamic from "next/dynamic"
import type { VideoTokenResponse } from "@fxprime/types"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const ProtectedVideoPlayer = dynamic(
  () => import("@/components/protected-video-player").then((m) => m.ProtectedVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    ),
  }
)

const ControlledYoutubePlayer = dynamic(
  () =>
    import("@/components/controlled-youtube-player").then((m) => m.ControlledYoutubePlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    ),
  }
)

interface CourseVideoPlayerProps {
  playback: VideoTokenResponse
  courseId: string
  lessonId: string
  watermarkText: string
  onWatchProgress?: (position: number, completed?: boolean) => void
  className?: string
}

export function CourseVideoPlayer({
  playback,
  courseId,
  lessonId,
  watermarkText,
  onWatchProgress,
  className,
}: CourseVideoPlayerProps) {
  if (!playback.sessionToken) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-[20px] bg-muted px-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Video playback unavailable.
      </div>
    )
  }

  if (playback.provider === "YOUTUBE") {
    return (
      <ControlledYoutubePlayer
        courseId={courseId}
        lessonId={lessonId}
        sessionToken={playback.sessionToken}
        watermarkText={watermarkText}
        startPosition={playback.watchPosition}
        duration={playback.duration}
        isCompleted={playback.isCompleted}
        onWatchProgress={onWatchProgress}
        className={className}
      />
    )
  }

  return (
    <ProtectedVideoPlayer
      courseId={courseId}
      lessonId={lessonId}
      sessionToken={playback.sessionToken}
      watermarkText={watermarkText}
      startPosition={playback.watchPosition}
      duration={playback.duration}
      isCompleted={playback.isCompleted}
      onWatchProgress={onWatchProgress}
      className={className}
    />
  )
}

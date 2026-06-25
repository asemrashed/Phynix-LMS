"use client"

import dynamic from "next/dynamic"
import type { VideoTokenResponse } from "@fxprime/types"
import { Spinner } from "@/components/ui/spinner"

const YoutubePlayer = dynamic(
  () => import("@/components/youtube-player").then((m) => m.YoutubePlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted">
        <Spinner className="h-8 w-8" />
      </div>
    ),
  }
)

const Html5VideoPlayer = dynamic(
  () => import("@/components/html5-video-player").then((m) => m.Html5VideoPlayer),
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
  watermarkText: string
  onWatchProgress?: (position: number, completed?: boolean) => void
  className?: string
}

export function CourseVideoPlayer({
  playback,
  watermarkText,
  onWatchProgress,
  className,
}: CourseVideoPlayerProps) {
  const common = {
    watermarkText,
    startPosition: playback.watchPosition,
    duration: playback.duration,
    isCompleted: playback.isCompleted,
    onWatchProgress,
    className,
  }

  if (playback.provider === "YOUTUBE" && playback.embedUrl) {
    return <YoutubePlayer embedUrl={playback.embedUrl} {...common} />
  }

  if (playback.provider === "SELF_HOSTED" && playback.streamUrl) {
    return <Html5VideoPlayer streamUrl={playback.streamUrl} {...common} />
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted text-sm text-muted-foreground">
      Video playback unavailable
    </div>
  )
}

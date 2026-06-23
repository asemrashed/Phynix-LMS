"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Player from "@vimeo/player"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  embedUrl: string
  watermarkText: string
  startPosition?: number
  duration?: number
  isCompleted?: boolean
  onWatchProgress?: (position: number, completed?: boolean) => void
  className?: string
}

const WATERMARK_POSITIONS = [
  "bottom-4 right-4",
  "bottom-4 left-4",
  "top-4 right-4",
  "top-16 left-4",
  "bottom-16 right-8",
  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
]

const SAVE_INTERVAL_MS = 15_000
const COMPLETE_THRESHOLD = 0.9

export function VideoPlayer({
  embedUrl,
  watermarkText,
  startPosition = 0,
  duration = 0,
  isCompleted = false,
  onWatchProgress,
  className,
}: VideoPlayerProps) {
  const [positionIndex, setPositionIndex] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<Player | null>(null)
  const lastSavedRef = useRef(0)

  const saveProgress = useCallback(
    async (seconds: number, forceComplete?: boolean) => {
      if (!onWatchProgress) return

      const shouldComplete =
        forceComplete ||
        (!isCompleted &&
          duration > 0 &&
          seconds / duration >= COMPLETE_THRESHOLD)

      if (
        Math.abs(seconds - lastSavedRef.current) < 5 &&
        !shouldComplete
      ) {
        return
      }

      lastSavedRef.current = seconds
      onWatchProgress(Math.floor(seconds), shouldComplete || undefined)
    },
    [duration, isCompleted, onWatchProgress]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionIndex((prev) => (prev + 1) % WATERMARK_POSITIONS.length)
    }, 45_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const player = new Player(iframe)
    playerRef.current = player

    const onTimeUpdate = (data: { seconds: number }) => {
      void saveProgress(data.seconds)
    }

    const onPause = (data: { seconds: number }) => {
      void saveProgress(data.seconds)
    }

    const onEnded = () => {
      void saveProgress(duration || 0, true)
    }

    player.on("timeupdate", onTimeUpdate)
    player.on("pause", onPause)
    player.on("ended", onEnded)

    if (startPosition > 0) {
      void player.setCurrentTime(startPosition).catch(() => {})
    }

    return () => {
      player.off("timeupdate", onTimeUpdate)
      player.off("pause", onPause)
      player.off("ended", onEnded)
      void player.destroy().catch(() => {})
      playerRef.current = null
    }
  }, [embedUrl, startPosition, duration, saveProgress])

  useEffect(() => {
    if (!onWatchProgress) return

    const interval = setInterval(async () => {
      const player = playerRef.current
      if (!player) return
      try {
        const seconds = await player.getCurrentTime()
        void saveProgress(seconds)
      } catch {
        // player not ready
      }
    }, SAVE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [saveProgress, onWatchProgress])

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[20px] bg-black",
        className
      )}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Course video"
      />

      {/* Corner watermarks */}
      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <span className="absolute left-3 top-3 text-[10px] font-semibold tracking-wide text-white/25">
          {watermarkText}
        </span>
        <span className="absolute bottom-3 right-3 text-[10px] font-semibold tracking-wide text-white/25">
          {watermarkText}
        </span>
      </div>

      {/* Floating watermark */}
      <div
        className={cn(
          "pointer-events-none absolute z-10 select-none rounded bg-black/20 px-2 py-1 text-xs font-medium text-white/40 backdrop-blur-sm transition-all duration-1000",
          WATERMARK_POSITIONS[positionIndex]
        )}
      >
        {watermarkText}
      </div>
    </div>
  )
}

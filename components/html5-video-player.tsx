"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Html5VideoPlayerProps {
  streamUrl: string
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

export function Html5VideoPlayer({
  streamUrl,
  watermarkText,
  startPosition = 0,
  duration = 0,
  isCompleted = false,
  onWatchProgress,
  className,
}: Html5VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSavedRef = useRef(0)
  const [positionIndex, setPositionIndex] = useState(0)

  const saveProgress = useCallback(
    (seconds: number, forceComplete?: boolean) => {
      if (!onWatchProgress) return

      const shouldComplete =
        forceComplete ||
        (!isCompleted && duration > 0 && seconds / duration >= COMPLETE_THRESHOLD)

      if (Math.abs(seconds - lastSavedRef.current) < 5 && !shouldComplete) return

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
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      void saveProgress(video.currentTime)
    }

    const onPause = () => {
      void saveProgress(video.currentTime)
    }

    const onEnded = () => {
      void saveProgress(duration || video.duration || 0, true)
    }

    const onLoaded = () => {
      if (startPosition > 0) {
        video.currentTime = startPosition
      }
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("pause", onPause)
    video.addEventListener("ended", onEnded)
    video.addEventListener("loadedmetadata", onLoaded)

    const interval = setInterval(() => {
      if (!video.paused) void saveProgress(video.currentTime)
    }, SAVE_INTERVAL_MS)

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("loadedmetadata", onLoaded)
      clearInterval(interval)
    }
  }, [streamUrl, startPosition, duration, saveProgress])

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[20px] bg-black",
        className
      )}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <span className="absolute left-3 top-3 text-[10px] font-semibold tracking-wide text-white/25">
          {watermarkText}
        </span>
        <span className="absolute bottom-3 right-3 text-[10px] font-semibold tracking-wide text-white/25">
          {watermarkText}
        </span>
      </div>

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

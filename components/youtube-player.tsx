"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface YoutubePlayerProps {
  videoId: string
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

type YtPlayer = {
  destroy: () => void
  getCurrentTime: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: (event: { target: YtPlayer }) => void
            onStateChange?: (event: { data: number; target: YtPlayer }) => void
          }
        }
      ) => YtPlayer
      PlayerState?: { ENDED: number; PAUSED: number; PLAYING: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let youtubeApiPromise: Promise<void> | null = null

function loadYoutubeApi() {
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }

    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(tag)
  })

  return youtubeApiPromise
}

export function YoutubePlayer({
  videoId,
  watermarkText,
  startPosition = 0,
  duration = 0,
  isCompleted = false,
  onWatchProgress,
  className,
}: YoutubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YtPlayer | null>(null)
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
    if (!videoId || !containerRef.current) return

    let cancelled = false
    let progressInterval: ReturnType<typeof setInterval> | null = null

    void loadYoutubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return

      const player = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
          ...(startPosition > 0 ? { start: Math.floor(startPosition) } : {}),
        },
        events: {
          onReady: (event) => {
            if (startPosition > 0) {
              event.target.seekTo(startPosition, true)
            }
          },
          onStateChange: (event) => {
            const ended = window.YT?.PlayerState?.ENDED
            const paused = window.YT?.PlayerState?.PAUSED
            if (event.data === ended) {
              void saveProgress(duration || 0, true)
            } else if (event.data === paused) {
              void saveProgress(event.target.getCurrentTime())
            }
          },
        },
      })

      playerRef.current = player

      progressInterval = setInterval(() => {
        try {
          void saveProgress(player.getCurrentTime())
        } catch {
          // player not ready
        }
      }, SAVE_INTERVAL_MS)
    })

    return () => {
      cancelled = true
      if (progressInterval) clearInterval(progressInterval)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, startPosition, duration, saveProgress])

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted text-sm text-muted-foreground">
        Video unavailable
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[20px] bg-black",
        className
      )}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

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

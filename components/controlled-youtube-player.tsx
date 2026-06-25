"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { VideoPlayerChrome } from "@/components/video-player-chrome"
import { getLessonEmbedUrl } from "@/lib/fetch-lesson-video"
import { VIDEO_PLAYER_CHANNEL } from "@/lib/video-player-constants"

const SAVE_INTERVAL_MS = 15_000
const COMPLETE_THRESHOLD = 0.9

interface ControlledYoutubePlayerProps {
  courseId: string
  lessonId: string
  sessionToken: string
  watermarkText: string
  startPosition?: number
  duration?: number
  isCompleted?: boolean
  onWatchProgress?: (position: number, completed?: boolean) => void
  className?: string
}

export function ControlledYoutubePlayer({
  courseId,
  lessonId,
  sessionToken,
  watermarkText,
  startPosition = 0,
  duration = 0,
  isCompleted = false,
  onWatchProgress,
  className,
}: ControlledYoutubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastSavedRef = useRef(0)
  const currentTimeRef = useRef(0)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(duration)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [positionIndex, setPositionIndex] = useState(0)

  const embedUrl = getLessonEmbedUrl(courseId, lessonId, sessionToken)

  const postCommand = useCallback(
    (cmd: string, extra?: Record<string, number>) => {
      iframeRef.current?.contentWindow?.postMessage(
        { channel: VIDEO_PLAYER_CHANNEL, cmd, ...extra },
        window.location.origin
      )
    },
    []
  )

  const saveProgress = useCallback(
    (seconds: number, forceComplete?: boolean) => {
      if (!onWatchProgress) return
      const total = videoDuration || duration
      const shouldComplete =
        forceComplete || (!isCompleted && total > 0 && seconds / total >= COMPLETE_THRESHOLD)
      if (Math.abs(seconds - lastSavedRef.current) < 5 && !shouldComplete) return
      lastSavedRef.current = seconds
      onWatchProgress(Math.floor(seconds), shouldComplete || undefined)
    },
    [duration, isCompleted, onWatchProgress, videoDuration]
  )

  const revealControls = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }, [playing])

  useEffect(() => {
    setReady(false)
    setLoadError(false)
    setPlaying(false)
    setCurrentTime(0)
  }, [embedUrl])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data as {
        channel?: string
        type?: string
        playing?: boolean
        currentTime?: number
        duration?: number
      }
      if (!data || data.channel !== VIDEO_PLAYER_CHANNEL) return

      if (data.type === "ready") {
        setReady(true)
        if (data.duration) setVideoDuration(data.duration)
        if (data.currentTime) setCurrentTime(data.currentTime)
        return
      }

      if (data.type === "time") {
        if (typeof data.currentTime === "number") {
          currentTimeRef.current = data.currentTime
          setCurrentTime(data.currentTime)
        }
        if (typeof data.duration === "number" && data.duration > 0) {
          setVideoDuration(data.duration)
        }
        if (typeof data.playing === "boolean") setPlaying(data.playing)
        return
      }

      if (data.type === "state" && typeof data.playing === "boolean") {
        setPlaying(data.playing)
        if (!data.playing) void saveProgress(currentTimeRef.current)
        return
      }

      if (data.type === "ended") {
        setPlaying(false)
        void saveProgress(
          typeof data.currentTime === "number" ? data.currentTime : currentTimeRef.current,
          true
        )
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [saveProgress])

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionIndex((prev) => (prev + 1) % 6)
    }, 45_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      void saveProgress(currentTime)
    }, SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [playing, currentTime, saveProgress])

  useEffect(() => {
    if (!ready) return
    postCommand("setSpeed", { rate: speed })
  }, [ready, speed, postCommand])

  useEffect(() => {
    if (!ready) return
    if (muted || volume === 0) {
      postCommand("mute")
    } else {
      postCommand("setVolume", { volume })
    }
  }, [ready, muted, volume, postCommand])

  const togglePlay = () => {
    if (!ready) return
    postCommand(playing ? "pause" : "play")
    revealControls()
  }

  const seek = (value: number[]) => {
    if (!ready || value[0] === undefined) return
    postCommand("seek", { time: value[0] })
    setCurrentTime(value[0])
    revealControls()
  }

  const skip = (delta: number) => {
    if (!ready) return
    const total = videoDuration || duration || 0
    const next = Math.max(0, Math.min(total, currentTime + delta))
    postCommand("seek", { time: next })
    setCurrentTime(next)
    revealControls()
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await el.requestFullscreen()
    revealControls()
  }

  if (loadError) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[20px] bg-muted px-6 text-center text-sm text-muted-foreground">
        Unable to load video. Please try again later.
      </div>
    )
  }

  const total = videoDuration || duration || 0

  return (
    <VideoPlayerChrome
      className={className}
      containerRef={containerRef}
      watermarkText={watermarkText}
      positionIndex={positionIndex}
      ready={ready}
      showControls={showControls}
      playing={playing}
      currentTime={currentTime}
      total={total}
      volume={volume}
      muted={muted}
      speed={speed}
      startPosition={startPosition}
      onRevealControls={revealControls}
      onTogglePlay={togglePlay}
      onSeek={seek}
      onSkip={skip}
      onMuteToggle={() => setMuted((m) => !m)}
      onVolumeChange={(next) => {
        setMuted(false)
        setVolume(next)
      }}
      onSpeedChange={setSpeed}
      onFullscreen={() => void toggleFullscreen()}
      onResumeSaved={() => {
        postCommand("seek", { time: startPosition })
        setCurrentTime(startPosition)
      }}
      onSurfaceClick={togglePlay}
    >
      <iframe
        ref={iframeRef}
        title="Lesson video"
        src={embedUrl}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setLoadError(true)}
      />
      {/* Blocks clicks from reaching YouTube title / channel links */}
      <div className="absolute inset-0 z-[5] cursor-pointer" aria-hidden="true" />
    </VideoPlayerChrome>
  )
}

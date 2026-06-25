"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { VideoPlayerChrome } from "@/components/video-player-chrome"
import { buildLessonVideoRequestUrl } from "@/lib/fetch-lesson-video"

const SAVE_INTERVAL_MS = 15_000
const COMPLETE_THRESHOLD = 0.9

interface ProtectedVideoPlayerProps {
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

export function ProtectedVideoPlayer({
  courseId,
  lessonId,
  sessionToken,
  watermarkText,
  startPosition = 0,
  duration = 0,
  isCompleted = false,
  onWatchProgress,
  className,
}: ProtectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSavedRef = useRef(0)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(duration)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [positionIndex, setPositionIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)

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
      if (videoRef.current && !videoRef.current.paused) setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setReady(false)
    setLoadError(false)

    video.src = buildLessonVideoRequestUrl(
      `/courses/${courseId}/lessons/${lessonId}/stream`,
      { session: sessionToken }
    )
    video.load()

    return () => {
      video.removeAttribute("src")
      video.load()
    }
  }, [courseId, lessonId, sessionToken])

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionIndex((prev) => (prev + 1) % 6)
    }, 45_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onError = () => setLoadError(true)
    const onLoaded = () => {
      setVideoDuration(video.duration || duration)
      if (startPosition > 0) video.currentTime = startPosition
      setReady(true)
    }
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onPlay = () => {
      setPlaying(true)
      revealControls()
    }
    const onPause = () => {
      setPlaying(false)
      setShowControls(true)
      void saveProgress(video.currentTime)
    }
    const onEnded = () => {
      setPlaying(false)
      setShowControls(true)
      void saveProgress(video.duration || videoDuration, true)
    }

    video.addEventListener("loadedmetadata", onLoaded)
    video.addEventListener("error", onError)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("ended", onEnded)

    const interval = setInterval(() => {
      if (!video.paused) void saveProgress(video.currentTime)
    }, SAVE_INTERVAL_MS)

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded)
      video.removeEventListener("error", onError)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("ended", onEnded)
      clearInterval(interval)
    }
  }, [duration, revealControls, saveProgress, startPosition, videoDuration])

  useEffect(() => {
    const video = videoRef.current
    if (video) video.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = muted ? 0 : volume
  }, [volume, muted])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  const seek = (value: number[]) => {
    const video = videoRef.current
    if (!video || value[0] === undefined) return
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const skip = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta))
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
        const video = videoRef.current
        if (video) video.currentTime = startPosition
      }}
      onSurfaceClick={togglePlay}
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />
    </VideoPlayerChrome>
  )
}

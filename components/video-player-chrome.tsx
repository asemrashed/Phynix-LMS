"use client"

import type { RefObject, ReactNode } from "react"
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import {
  VIDEO_PLAYBACK_SPEEDS,
  VIDEO_WATERMARK_POSITIONS,
  formatVideoTime,
} from "@/lib/video-player-constants"
import { cn } from "@/lib/utils"

interface VideoPlayerChromeProps {
  className?: string
  containerRef: RefObject<HTMLDivElement | null>
  watermarkText: string
  positionIndex: number
  ready: boolean
  showControls: boolean
  playing: boolean
  currentTime: number
  total: number
  volume: number
  muted: boolean
  speed: number
  startPosition?: number
  onRevealControls: () => void
  onTogglePlay: () => void
  onSeek: (value: number[]) => void
  onSkip: (delta: number) => void
  onMuteToggle: () => void
  onVolumeChange: (volume: number) => void
  onSpeedChange: (speed: number) => void
  onFullscreen: () => void
  onResumeSaved?: () => void
  onSurfaceClick?: () => void
  children: ReactNode
}

export function VideoPlayerChrome({
  className,
  containerRef,
  watermarkText,
  positionIndex,
  ready,
  showControls,
  playing,
  currentTime,
  total,
  volume,
  muted,
  speed,
  startPosition = 0,
  onRevealControls,
  onTogglePlay,
  onSeek,
  onSkip,
  onMuteToggle,
  onVolumeChange,
  onSpeedChange,
  onFullscreen,
  onResumeSaved,
  onSurfaceClick,
  children,
}: VideoPlayerChromeProps) {
  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video overflow-hidden rounded-[20px] bg-black",
        className
      )}
      onMouseMove={onRevealControls}
      onTouchStart={onRevealControls}
    >
      <div className="absolute inset-0" onClick={onSurfaceClick}>
        {children}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <span className="absolute left-3 top-3 text-[10px] font-semibold tracking-wide text-white/25">
          {watermarkText}
        </span>
        <span className="absolute bottom-14 right-3 text-[10px] font-semibold tracking-wide text-white/25">
          {watermarkText}
        </span>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute z-10 select-none rounded bg-black/20 px-2 py-1 text-xs font-medium text-white/40 backdrop-blur-sm transition-all duration-1000",
          VIDEO_WATERMARK_POSITIONS[positionIndex]
        )}
      >
        {watermarkText}
      </div>

      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-sm text-white">
          Loading video…
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Slider
          value={[currentTime]}
          min={0}
          max={total || 100}
          step={0.1}
          onValueChange={onSeek}
          className="mb-3"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-lg text-white hover:bg-white/20 hover:text-white"
            onClick={onTogglePlay}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-lg text-white hover:bg-white/20 hover:text-white"
            onClick={() => onSkip(-10)}
            title="Back 10s"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-lg text-white hover:bg-white/20 hover:text-white"
            onClick={() => onSkip(10)}
            title="Forward 10s"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <span className="min-w-[88px] text-xs tabular-nums text-white/90">
            {formatVideoTime(currentTime)} / {formatVideoTime(total)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-lg text-white hover:bg-white/20 hover:text-white"
              onClick={onMuteToggle}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            <div className="hidden w-24 sm:block">
              <Slider
                value={[muted ? 0 : volume]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(v) => onVolumeChange(v[0] ?? 0)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-white hover:bg-white/20 hover:text-white"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Playback speed
                </p>
                {VIDEO_PLAYBACK_SPEEDS.map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => onSpeedChange(rate)}
                    className={cn(speed === rate && "bg-muted")}
                  >
                    {rate === 1 ? "Normal" : `${rate}x`}
                  </DropdownMenuItem>
                ))}
                {startPosition > 0 && onResumeSaved && (
                  <DropdownMenuItem onClick={onResumeSaved}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resume from saved
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-lg text-white hover:bg-white/20 hover:text-white"
              onClick={onFullscreen}
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

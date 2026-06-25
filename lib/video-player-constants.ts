export const VIDEO_WATERMARK_POSITIONS = [
  "bottom-16 right-4",
  "bottom-16 left-4",
  "top-4 right-4",
  "top-16 left-4",
  "bottom-24 right-8",
  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
] as const

export const VIDEO_PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export const VIDEO_PLAYER_CHANNEL = "phynix-video"

export function formatVideoTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

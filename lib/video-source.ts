import type { VideoProvider } from "@fxprime/types"

export const VIDEO_PROVIDER_LABELS: Record<VideoProvider, string> = {
  VIMEO: "Vimeo",
  YOUTUBE: "YouTube",
  SELF_HOSTED: "Upload (VPS / local)",
}

export function parseYoutubeId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export function parseVimeoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed

  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

export function youtubeThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function getLessonVideoRef(lesson: {
  videoProvider?: VideoProvider
  videoRef?: string | null
  vimeoId?: string | null
}): { provider: VideoProvider; ref: string | null } {
  const provider = lesson.videoProvider ?? "VIMEO"
  if (lesson.videoRef?.trim()) return { provider, ref: lesson.videoRef.trim() }
  if (lesson.vimeoId?.trim()) return { provider: "VIMEO", ref: lesson.vimeoId.trim() }
  return { provider, ref: null }
}

export function extractYoutubeIdFromEmbedUrl(embedUrl: string): string | null {
  const match = embedUrl.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

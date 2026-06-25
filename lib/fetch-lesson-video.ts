import type { VideoPlayMeta } from "@fxprime/types"
import { getAccessToken } from "@/lib/api"
import { resolveApiUrl } from "@/lib/api-url"

export type LessonPlayKind = VideoPlayMeta["kind"]

function authHeaders(): HeadersInit {
  const headers: HeadersInit = {}
  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/** Supports relative `/api/v1` (same-origin proxy) and absolute API bases. */
export function buildLessonVideoRequestUrl(
  path: string,
  params: Record<string, string>
): string {
  const base = resolveApiUrl(path)
  const isAbsolute = base.startsWith("http://") || base.startsWith("https://")
  const url = isAbsolute
    ? new URL(base)
    : new URL(base, window.location.origin)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`
}

/** Same-origin embed page URL — YouTube ID stays server-side; client only sees session token. */
export function getLessonEmbedUrl(
  courseId: string,
  lessonId: string,
  sessionToken: string
): string {
  return buildLessonVideoRequestUrl(
    `/courses/${courseId}/lessons/${lessonId}/embed`,
    { session: sessionToken, origin: window.location.origin }
  )
}

export async function fetchLessonPlayMeta(
  courseId: string,
  lessonId: string,
  sessionToken: string
): Promise<VideoPlayMeta> {
  const res = await fetch(
    resolveApiUrl(`/courses/${courseId}/lessons/${lessonId}/play-meta`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ sessionToken }),
      cache: "no-store",
    }
  )

  const json = (await res.json()) as { success?: boolean; data?: VideoPlayMeta }
  if (!res.ok || !json.success || !json.data) {
    throw new Error("Could not load video metadata")
  }
  return json.data
}

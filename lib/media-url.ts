import { getApiOrigin } from "@/lib/api-url"

/** Rewrite api-host /uploads/* URLs to a same-origin path (avoids CORP blocking). */
export function normalizeUploadUrl(url: string | null | undefined): string | null {
  if (!url) return null

  if (url.startsWith("/uploads/")) return url

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url)
      if (parsed.pathname.startsWith("/uploads/")) {
        return parsed.pathname
      }
    } catch {
      // fall through
    }
    return url
  }

  return url.startsWith("/") ? url : `/${url}`
}

export function getMediaUrl(relativePath: string | null | undefined): string | null {
  const normalized = normalizeUploadUrl(relativePath)
  if (!normalized) return null

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized
  }

  // Same-origin uploads are proxied via Next rewrite — relative path avoids CORP
  // and keeps Next Image on the app origin.
  if (normalized.startsWith("/uploads/")) {
    return normalized
  }

  const origin = getApiOrigin()
  return `${origin}${normalized.startsWith("/") ? normalized : `/${normalized}`}`
}

/** Absolute URL for Open Graph / external consumers. */
export function getAbsoluteMediaUrl(relativePath: string | null | undefined): string | null {
  const url = getMediaUrl(relativePath)
  if (!url) return null
  if (url.startsWith("http://") || url.startsWith("https://")) return url

  const origin = getApiOrigin()
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`
}

export const BLOG_COVER_PLACEHOLDER = "/Demo.avif"

export function getBlogCoverUrl(coverUrl: string | null | undefined): string {
  const trimmed = coverUrl?.trim()
  if (!trimmed) return BLOG_COVER_PLACEHOLDER
  return getMediaUrl(trimmed) ?? BLOG_COVER_PLACEHOLDER
}

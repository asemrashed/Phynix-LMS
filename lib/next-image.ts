const ALLOWED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "fxprimeacademy.com",
  "api.fxprimeacademy.com",
  "images.unsplash.com",
  "img.youtube.com",
])

export function canUseNextImage(src: string): boolean {
  if (!src) return false
  if (src.startsWith("/")) return true

  try {
    const parsed = new URL(src)
    if (parsed.pathname.startsWith("/uploads/")) return true
    if (ALLOWED_HOSTS.has(parsed.hostname)) return true
    if (parsed.hostname.endsWith(".amazonaws.com")) return true
  } catch {
    return false
  }

  return false
}

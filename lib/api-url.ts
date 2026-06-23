const DEFAULT_API_PATH = "/api/v1"
const SERVER_FETCH_TIMEOUT_MS = 8_000

/** Browser + SSR API base (relative `/api/v1` uses same-origin proxy). */
export function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (configured) return configured
  return DEFAULT_API_PATH
}

/**
 * Absolute API URL for server-side fetch during `next build` / SSR.
 * Relative `NEXT_PUBLIC_API_URL` is proxied in the browser but not during static generation.
 */
export function resolveServerApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (configured?.startsWith("http://") || configured?.startsWith("https://")) {
    const base = configured.replace(/\/$/, "")
    return `${base}${normalizedPath}`
  }

  const internal = (
    process.env.API_INTERNAL_URL ||
    process.env.BACKEND_INTERNAL_URL ||
    "http://127.0.0.1:4000"
  ).replace(/\/$/, "")

  return `${internal}/api/v1${normalizedPath}`
}

export async function fetchServerApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(resolveServerApiUrl(path), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
    })
    const json = (await res.json()) as { success?: boolean; data?: T }
    if (!json.success || json.data === undefined) return null
    return json.data
  } catch {
    return null
  }
}

/** Origin for static uploads and WebSocket (no `/api/v1` suffix). */
export function getApiOrigin(): string {
  const apiUrl = getApiUrl()
  if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
    return apiUrl.replace(/\/api\/v\d+\/?$/, "")
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (site) return site.replace(/\/$/, "")

  return "http://localhost:3000"
}

/** Socket.IO server — HTTP API may be proxied; WS usually needs the direct backend host. */
export function getWsOrigin(): string {
  const ws = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (ws) return ws.replace(/\/$/, "")

  const direct = process.env.NEXT_PUBLIC_API_DIRECT_URL?.trim()
  if (direct) {
    return direct.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "")
  }

  const apiUrl = getApiUrl()
  if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
    return apiUrl.replace(/\/api\/v\d+\/?$/, "")
  }

  return getApiOrigin()
}

export function resolveApiUrl(path: string): string {
  const base = getApiUrl().replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalizedPath}`
}

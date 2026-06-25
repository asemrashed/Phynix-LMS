export function buildPricingUrl(sessionId?: string | null): string {
  if (!sessionId) return "/live"
  const params = new URLSearchParams({ sessionId })
  return `/live?${params.toString()}`
}

export function buildLiveHubUrl(options?: {
  registerSession?: string | null
  registered?: boolean
}): string {
  const params = new URLSearchParams()
  if (options?.registerSession) params.set("registerSession", options.registerSession)
  if (options?.registered) params.set("registered", "1")
  const query = params.toString()
  return query ? `/live?${query}` : "/live"
}

export function parseSessionIdFromSearch(
  searchParams: URLSearchParams
): string | null {
  return searchParams.get("sessionId") || searchParams.get("registerSession")
}

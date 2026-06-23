export function buildSubscriptionCheckoutUrl(options?: {
  plan?: "PRO" | "LIFETIME" | "BASIC"
  sessionId?: string | null
}): string {
  const params = new URLSearchParams()
  params.set("plan", options?.plan ?? "PRO")
  if (options?.sessionId) params.set("sessionId", options.sessionId)
  return `/checkout/subscription?${params.toString()}`
}

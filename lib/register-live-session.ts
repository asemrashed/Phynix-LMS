import { api, ApiError } from "@/lib/api"
import { buildPricingUrl } from "@/lib/live-session-intent"

export type RegisterLiveSessionResult =
  | { ok: true }
  | { ok: false; code: string; message: string; redirectTo?: string }

export async function registerLiveSession(
  sessionId: string
): Promise<RegisterLiveSessionResult> {
  try {
    await api(`/sessions/${sessionId}/register`, { method: "POST" })
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === "PREMIUM_REQUIRED") {
        return {
          ok: false,
          code: err.code,
          message: err.message,
          redirectTo: buildPricingUrl(sessionId),
        }
      }
      return { ok: false, code: err.code ?? "ERROR", message: err.message }
    }
    return { ok: false, code: "ERROR", message: "Registration failed" }
  }
}

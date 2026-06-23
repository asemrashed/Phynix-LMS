import type { ApiResponse, ApiErrorBody } from "@fxprime/types"
import { resolveApiUrl } from "@/lib/api-url"

export class ApiError extends Error {
  code: string
  status: number

  constructor(error: ApiErrorBody, status: number) {
    super(error.message)
    this.code = error.code
    this.status = status
    this.name = "ApiError"
  }
}

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(resolveApiUrl(path), {
    ...options,
    credentials: "include",
    headers,
  })

  const json = (await res.json()) as ApiResponse<T>

  if (!json.success) {
    throw new ApiError(json.error, res.status)
  }

  return json.data
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(resolveApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  })

  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) {
    throw new ApiError(json.error, res.status)
  }
  return json.data
}

export async function clearSessionCookies(): Promise<void> {
  try {
    await fetch(resolveApiUrl("/auth/clear-session"), {
      method: "POST",
      credentials: "include",
    })
  } catch {
    // ignore network errors
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const data = await api<{ accessToken: string; expiresIn: number }>(
      "/auth/refresh",
      { method: "POST" }
    )
    setAccessToken(data.accessToken)
    return data.accessToken
  } catch {
    setAccessToken(null)
    await clearSessionCookies()
    return null
  }
}

export async function apiStream<TDone>(
  path: string,
  body: object,
  handlers: {
    onToken?: (delta: string) => void
    onDone?: (result: TDone) => void
    onError?: (message: string) => void
  }
): Promise<TDone | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(resolveApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as ApiResponse<unknown> | null
    if (json && !json.success) {
      throw new ApiError(json.error, res.status)
    }
    throw new ApiError({ code: "STREAM_ERROR", message: "Stream request failed" }, res.status)
  }

  if (!res.body) {
    throw new ApiError({ code: "STREAM_ERROR", message: "Empty stream body" }, 500)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let doneResult: TDone | null = null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""

    for (const part of parts) {
      const lines = part.split("\n")
      let event = "message"
      let data = ""
      for (const line of lines) {
        if (line.startsWith("event: ")) event = line.slice(7).trim()
        if (line.startsWith("data: ")) data = line.slice(6)
      }
      if (!data) continue

      const parsed = JSON.parse(data) as Record<string, unknown>
      if (event === "token" && typeof parsed.delta === "string") {
        handlers.onToken?.(parsed.delta)
      } else if (event === "done") {
        doneResult = parsed as TDone
        handlers.onDone?.(doneResult)
      } else if (event === "error") {
        const message = typeof parsed.message === "string" ? parsed.message : "Stream error"
        handlers.onError?.(message)
        throw new ApiError({ code: "STREAM_ERROR", message }, 500)
      }
    }
  }

  return doneResult
}

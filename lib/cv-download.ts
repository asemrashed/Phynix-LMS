import { getAccessToken } from "@/lib/api"
import { resolveApiUrl } from "@/lib/api-url"
import type { StudentCvDraft } from "@fxprime/types"

export async function downloadCvPdf(draft: StudentCvDraft, filename?: string) {
  const token = getAccessToken()
  if (!token) throw new Error("Please log in to download your CV")

  const res = await fetch(resolveApiUrl("/students/me/cv/pdf"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error?.message || "Failed to generate CV PDF")
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename || "FXPrime-CV.pdf"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

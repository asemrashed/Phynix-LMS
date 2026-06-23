import { getAccessToken } from "@/lib/api"
import { resolveApiUrl } from "@/lib/api-url"

export async function downloadCertificatePdf(certCode: string): Promise<void> {
  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(resolveApiUrl(`/certificates/${certCode}/download`), {
    credentials: "include",
    headers,
  })

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(json?.error?.message || "Failed to download certificate")
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${certCode}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

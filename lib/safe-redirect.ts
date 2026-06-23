import { getDefaultPanelPath } from "@/lib/get-default-panel"

/** Allow same-origin relative paths only (blocks open redirects). */
export function isSafeInternalRedirect(path: string): boolean {
  if (!path.startsWith("/")) return false
  if (path.startsWith("//")) return false
  if (path.includes("://")) return false
  return true
}

export function resolvePostAuthRedirect(
  redirectParam: string | null | undefined,
  role: string | null | undefined
): string {
  if (redirectParam && isSafeInternalRedirect(redirectParam)) {
    return redirectParam
  }
  return getDefaultPanelPath(role)
}

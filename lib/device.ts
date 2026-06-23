import type { DeviceType } from "@fxprime/types"

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "PC"
  const ua = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  return isMobile ? "MOBILE" : "PC"
}

export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server"
  const parts = [
    navigator.userAgent,
    navigator.platform,
    screen.width,
    screen.height,
    navigator.language,
  ].join("|")

  let hash = 0
  for (let i = 0; i < parts.length; i++) {
    const char = parts.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return `fp_${Math.abs(hash).toString(16)}`
}

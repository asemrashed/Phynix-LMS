const MAX_AGE_SEC = 7 * 24 * 60 * 60

export function setUserRoleCookie(role: string) {
  document.cookie = `userRole=${encodeURIComponent(role)}; path=/; max-age=${MAX_AGE_SEC}; samesite=lax`
}

export function clearUserRoleCookie() {
  document.cookie = "userRole=; path=/; max-age=0; samesite=lax"
}

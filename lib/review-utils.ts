export const REVIEW_PROGRESS_THRESHOLD = 80

export function reviewDismissKey(courseId: string) {
  return `fxp-review-dismissed-${courseId}`
}

export function isReviewPromptDismissed(courseId: string): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(reviewDismissKey(courseId)) === "1"
}

export function dismissReviewPrompt(courseId: string) {
  localStorage.setItem(reviewDismissKey(courseId), "1")
}

export function clearReviewPromptDismissed(courseId: string) {
  localStorage.removeItem(reviewDismissKey(courseId))
}

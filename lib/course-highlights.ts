import type { CourseDetail } from "@fxprime/types"

export function resolveCourseHighlights(
  course: CourseDetail,
  totalLessons: number,
  displayDuration: string,
  freePreviewCount: number
): string[] {
  if (course.highlights.length > 0) return course.highlights

  const computed: string[] = []
  if (totalLessons > 0) {
    computed.push(`${totalLessons} structured lesson${totalLessons > 1 ? "s" : ""}`)
  }
  if (displayDuration && displayDuration !== "—") {
    computed.push(`${displayDuration} of content`)
  }
  computed.push("Lifetime access")
  if (freePreviewCount > 0) {
    computed.push(
      `${freePreviewCount} free preview lesson${freePreviewCount > 1 ? "s" : ""}`
    )
  }
  computed.push("Certificate of completion")
  return computed
}

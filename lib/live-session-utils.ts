type SessionEnrollmentHint = {
  type: string
  courseId?: string | null
  isPublic?: boolean
}

export function needsCourseEnrollment(session: SessionEnrollmentHint): boolean {
  if (session.courseId && session.type === "COURSE_CLASS") return true
  if (session.courseId && session.isPublic === false) return true
  return false
}

export function courseEnrollHref(courseSlug?: string | null): string {
  if (courseSlug) return `/courses/${courseSlug}`
  return "/courses"
}

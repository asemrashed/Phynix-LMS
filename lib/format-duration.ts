export function sumLessonDuration(
  sections: { lessons: { duration: number }[] }[]
): number {
  return sections.reduce(
    (total, section) =>
      total + section.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
    0
  )
}

export function formatCourseDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

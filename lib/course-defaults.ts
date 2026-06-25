export const DEFAULT_COURSE_OUTCOMES: Record<string, string[]> = {
  ENGLISH: [
    "Understand the English exam format and scoring system",
    "Improve Listening, Reading, Writing, and Speaking skills",
    "Practice with mock tests and exam-style tasks",
    "Learn time management and test-taking strategies",
    "Earn a certificate upon 100% completion",
  ],
}

export function resolveCourseOutcomes(
  language: string,
  learningOutcomes: string[] | undefined | null
): string[] {
  if (learningOutcomes && learningOutcomes.length > 0) {
    return learningOutcomes
  }
  return DEFAULT_COURSE_OUTCOMES[language] ?? DEFAULT_COURSE_OUTCOMES.ENGLISH
}

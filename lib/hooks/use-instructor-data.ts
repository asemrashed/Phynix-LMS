"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type {
  CourseReviewItem,
  InstructorAnalytics,
  InstructorCourseItem,
  InstructorCourseStudentsResponse,
  InstructorProfile,
  InstructorStats,
} from "@fxprime/types"

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useAsyncFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load data. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, error, refetch }
}

export interface InstructorOverview {
  stats: InstructorStats
  courses: InstructorCourseItem[]
}

export function useInstructorOverview(): AsyncState<InstructorOverview> {
  return useAsyncFetch(async () => {
    const [stats, courses] = await Promise.all([
      api<InstructorStats>("/instructor/stats"),
      api<InstructorCourseItem[]>("/instructor/courses"),
    ])
    return { stats, courses }
  })
}

export function useInstructorAnalytics(): AsyncState<InstructorAnalytics> {
  return useAsyncFetch(() => api<InstructorAnalytics>("/instructor/analytics"))
}

export function useInstructorProfile(): AsyncState<InstructorProfile> {
  return useAsyncFetch(() => api<InstructorProfile>("/instructor/profile"))
}

export function useInstructorCourseStudents(
  slug: string,
  page: number,
  search: string
): AsyncState<InstructorCourseStudentsResponse> {
  return useAsyncFetch(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    })
    if (search.trim()) params.set("search", search.trim())
    return api<InstructorCourseStudentsResponse>(
      `/instructor/courses/${slug}/students?${params}`
    )
  }, [slug, page, search])
}

export function useInstructorCourseReviews(
  slug: string
): AsyncState<CourseReviewItem[]> {
  return useAsyncFetch(
    () => api<CourseReviewItem[]>(`/instructor/courses/${slug}/reviews`),
    [slug]
  )
}

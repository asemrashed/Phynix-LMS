"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type {
  BlogPostListItem,
  CourseListItem,
  PlatformStats,
  TestimonialItem,
} from "@fxprime/types"

export interface HomepageTestimonials {
  video: TestimonialItem[]
  screenshots: TestimonialItem[]
  trustpilot: TestimonialItem[]
}

export interface HomepageData {
  stats: PlatformStats | null
  featuredCourses: CourseListItem[]
  blogPosts: BlogPostListItem[]
  testimonials: HomepageTestimonials
  loading: boolean
}

const emptyTestimonials: HomepageTestimonials = {
  video: [],
  screenshots: [],
  trustpilot: [],
}

async function fetchFeaturedCourses(): Promise<CourseListItem[]> {
  try {
    let data = await api<{ courses: CourseListItem[]; total: number }>(
      "/courses?featured=true&limit=4"
    )
    if (data.courses.length === 0) {
      data = await api<{ courses: CourseListItem[]; total: number }>("/courses?limit=4")
    }
    return data.courses
  } catch {
    return []
  }
}

export function useHomepageData(): HomepageData {
  const [data, setData] = useState<HomepageData>({
    stats: null,
    featuredCourses: [],
    blogPosts: [],
    testimonials: emptyTestimonials,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const results = await Promise.allSettled([
        api<PlatformStats>("/stats"),
        fetchFeaturedCourses(),
        api<{ posts: BlogPostListItem[]; total: number }>("/blog?limit=6"),
        api<TestimonialItem[]>("/testimonials?type=VIDEO"),
        api<TestimonialItem[]>("/testimonials?type=SCREENSHOT"),
        api<TestimonialItem[]>("/testimonials?type=TRUSTPILOT"),
      ])

      if (cancelled) return

      setData({
        stats: results[0].status === "fulfilled" ? results[0].value : null,
        featuredCourses: results[1].status === "fulfilled" ? results[1].value : [],
        blogPosts:
          results[2].status === "fulfilled" ? results[2].value.posts : [],
        testimonials: {
          video: results[3].status === "fulfilled" ? results[3].value : [],
          screenshots: results[4].status === "fulfilled" ? results[4].value : [],
          trustpilot: results[5].status === "fulfilled" ? results[5].value : [],
        },
        loading: false,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return data
}

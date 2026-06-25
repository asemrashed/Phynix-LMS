"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { CourseDetail, CourseListItem } from "@fxprime/types"
import { api } from "@/lib/api"
import { resolveCourseOutcomes } from "@/lib/course-defaults"
import { CourseCard } from "@/components/course-card"
import { Award, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCourseDuration } from "@/lib/format-duration"
import { getMediaUrl } from "@/lib/media-url"

interface CourseDetailExtrasProps {
  course: CourseDetail
}

export function CourseDetailExtras({ course }: CourseDetailExtrasProps) {
  const [related, setRelated] = useState<CourseListItem[]>([])

  useEffect(() => {
    api<{ courses: CourseListItem[] }>("/courses?limit=6")
      .then((data) =>
        setRelated(
          data.courses.filter((c) => c.slug !== course.slug && c.price > 0).slice(0, 2)
        )
      )
      .catch(() => {})
  }, [course.slug])

  const outcomes = resolveCourseOutcomes(course.language, course.learningOutcomes)

  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="text-xl font-bold text-foreground">What you&apos;ll learn</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {outcomes.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[20px] bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Earn a Certificate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete all lessons to receive a verifiable PDF certificate for your portfolio and CV.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Continue your journey</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="rounded-xl">
                All courses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <CourseCard
                key={item.id}
                id={item.slug}
                courseId={item.id}
                title={item.title}
                image={
                  getMediaUrl(item.thumbnailUrl) ||
                  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop"
                }
                price={item.price}
                originalPrice={item.originalPrice ?? undefined}
                rating={item.averageRating}
                students={item.enrollmentCount}
                duration={formatCourseDuration(item.totalDuration)}
                category={item.level}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

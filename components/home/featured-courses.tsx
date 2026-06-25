"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { LandingContainer } from "@/components/home/landing-container"
import { motion } from "framer-motion"
import type { CourseListItem, PublicHomepageSection } from "@fxprime/types"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/media-url"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

export function FeaturedCourses({
  courses: externalCourses,
  isLoading: externalLoading,
  section,
}: {
  courses?: CourseListItem[]
  isLoading?: boolean
  section?: PublicHomepageSection | null
} = {}) {
  const content = mergeHomepageSection("featured_courses", section)
  const destructiveEyebrow = content.metadata?.eyebrowVariant === "destructive"
  const cta = content.ctaPrimary ?? { label: "View All Courses", href: "/courses" }

  const usesExternal = externalCourses !== undefined
  const [courses, setCourses] = useState<CourseListItem[]>(externalCourses ?? [])
  const [loading, setLoading] = useState(!usesExternal)

  useEffect(() => {
    if (usesExternal) {
      setCourses(externalCourses)
      return
    }
    async function fetchCourses() {
      try {
        let data = await api<{ courses: CourseListItem[]; total: number }>(
          "/courses?featured=true&limit=4"
        )
        if (data.courses.length === 0) {
          data = await api<{ courses: CourseListItem[]; total: number }>("/courses?limit=4")
        }
        setCourses(data.courses)
      } catch (err) {
        console.error("Failed to load featured courses:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [usesExternal, externalCourses])

  const showLoading = usesExternal ? (externalLoading ?? false) : loading

  return (
    <section className="py-20">
      <LandingContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          {content.eyebrow && (
            <div className="mb-4 flex items-center justify-center gap-2">
              {destructiveEyebrow && (
                <span className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
              )}
              <span
                className={
                  destructiveEyebrow
                    ? "text-sm font-semibold uppercase tracking-wider text-destructive"
                    : "text-sm font-semibold uppercase tracking-wider text-primary"
                }
              >
                {content.eyebrow}
              </span>
            </div>
          )}
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            {content.title ?? "Start Your English Journey"}
          </h2>
          {content.description && (
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{content.description}</p>
          )}
        </motion.div>

        {showLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[20px] bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CourseCard
                  id={course.slug}
                  courseId={course.id}
                  title={course.title}
                  image={
                    getMediaUrl(course.thumbnailUrl) ||
                    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
                  }
                  price={course.price}
                  originalPrice={course.originalPrice ?? undefined}
                  rating={course.averageRating}
                  students={course.enrollmentCount}
                  duration={`${Math.round(course.totalDuration / 3600)}h`}
                  category={course.level}
                  isFree={course.price === 0}
                  isLive={course.isFeatured}
                />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button variant="outline" size="lg" className="rounded-xl" asChild>
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </LandingContainer>
    </section>
  )
}

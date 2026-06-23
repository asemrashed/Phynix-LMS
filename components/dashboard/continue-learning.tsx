"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, ArrowRight, Clock, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/media-url"

interface EnrolledCourse {
  id: string
  slug: string
  title: string
  progress: number
  lastLessonId: string | null
  lastLessonTitle: string | null
  watchPosition?: number
  thumbnailUrl: string | null
}

interface ContinueLearningProps {
  courses: EnrolledCourse[]
  className?: string
}

function formatResumeTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function courseResumeHref(course: EnrolledCourse): string {
  const base = `/dashboard/courses/${course.slug}`
  if (course.lastLessonId) {
    return `${base}?lesson=${course.lastLessonId}`
  }
  return base
}

function pickFeatured(courses: EnrolledCourse[]): EnrolledCourse | null {
  if (courses.length === 0) return null
  const withWatch = courses.find((c) => (c.watchPosition ?? 0) > 0)
  if (withWatch) return withWatch
  return [...courses].sort((a, b) => b.progress - a.progress)[0]
}

function CourseThumbnail({
  thumbnailUrl,
  title,
  large,
}: {
  thumbnailUrl: string | null
  title: string
  large?: boolean
}) {
  const src = getMediaUrl(thumbnailUrl)
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5",
        large ? "h-28 w-full sm:h-32" : "h-14 w-20"
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <BookOpen className={cn("text-primary/40", large ? "h-10 w-10" : "h-6 w-6")} />
        </div>
      )}
    </div>
  )
}

export function ContinueLearning({ courses, className }: ContinueLearningProps) {
  if (courses.length === 0) {
    return (
      <div className={cn("rounded-[20px] bg-card p-6 shadow-sm", className)}>
        <h2 className="mb-4 text-xl font-bold text-foreground">Continue Learning</h2>
        <p className="text-muted-foreground">No enrolled courses yet.</p>
        <Link href="/courses">
          <Button className="mt-4 rounded-xl">Browse Courses</Button>
        </Link>
      </div>
    )
  }

  const featured = pickFeatured(courses)
  const others = courses.filter((c) => c.id !== featured?.id).slice(0, 3)

  return (
    <div className={cn("rounded-[20px] bg-card p-6 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="sm" className="rounded-xl">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {featured && (
        <Link href={courseResumeHref(featured)}>
          <motion.div
            whileHover={{ y: -2 }}
            className="mb-4 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    Pick up where you left off
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                  {featured.title}
                </h3>
                {featured.lastLessonTitle && (
                  <p className="text-sm text-muted-foreground">
                    {featured.watchPosition && featured.watchPosition > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Resume at {formatResumeTime(featured.watchPosition)} —{" "}
                        {featured.lastLessonTitle}
                      </span>
                    ) : (
                      <span>Up next: {featured.lastLessonTitle}</span>
                    )}
                  </p>
                )}
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{featured.progress}% complete</span>
                  </div>
                  <Progress value={featured.progress} className="h-2" />
                </div>
                <Button size="sm" className="rounded-xl">
                  <Play className="mr-2 h-3.5 w-3.5" />
                  {featured.watchPosition && featured.watchPosition > 0
                    ? "Continue Watching"
                    : "Resume Lesson"}
                </Button>
              </div>
              <CourseThumbnail
                thumbnailUrl={featured.thumbnailUrl}
                title={featured.title}
                large
              />
            </div>
          </motion.div>
        </Link>
      )}

      {others.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {others.map((course) => (
            <Link key={course.id} href={courseResumeHref(course)}>
              <motion.div
                whileHover={{ y: -2 }}
                className="flex gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-shadow hover:shadow-md"
              >
                <CourseThumbnail
                  thumbnailUrl={course.thumbnailUrl}
                  title={course.title}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <Progress value={course.progress} className="mt-2 h-1.5" />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {course.progress}% complete
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

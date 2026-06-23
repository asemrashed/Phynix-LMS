"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProgressCard } from "@/components/progress-card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/media-url"
import type { StudentEnrollmentItem } from "@fxprime/types"
import { ArrowRight } from "lucide-react"

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const data = await api<StudentEnrollmentItem[]>("/courses/enrollments/me")
        setEnrollments(data)
      } catch (err) {
        console.error(err)
        setEnrollments([])
      } finally {
        setLoading(false)
      }
    }
    fetchEnrollments()
  }, [])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            My Courses
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress across all enrolled courses
          </p>
        </div>
        <Link href="/courses">
          <Button className="rounded-xl">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[20px] bg-muted" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-[20px] bg-card p-12 text-center">
          <p className="text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/courses">
            <Button className="mt-4 rounded-xl">Explore Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <ProgressCard
              key={enrollment.id}
              title={enrollment.course.title}
              image={
                getMediaUrl(enrollment.course.thumbnailUrl) ||
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
              }
              progress={enrollment.progress}
              totalLessons={enrollment.totalLessons}
              completedLessons={enrollment.completedLessons}
              href={`/dashboard/courses/${enrollment.course.slug}`}
              nextLesson={enrollment.lastLessonTitle || "Continue learning"}
              lastAccessed={new Date(enrollment.enrolledAt).toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  )
}

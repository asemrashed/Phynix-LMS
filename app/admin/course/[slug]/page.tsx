"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminCourseDetail } from "@fxprime/types"
import { CourseBuilder } from "@/components/admin/course-builder"
import { Spinner } from "@/components/ui/spinner"

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.slug as string
  const [course, setCourse] = useState<AdminCourseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<AdminCourseDetail>(`/admin/courses/${courseSlug}`)
      .then(setCourse)
      .catch(() => router.push("/admin/courses"))
      .finally(() => setLoading(false))
  }, [courseSlug, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!course) return null

  return <CourseBuilder mode="edit" initialCourse={course} />
}

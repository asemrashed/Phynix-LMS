"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminCourseDetail, AdminInstructorItem } from "@fxprime/types"
import { CourseBuilder } from "@/components/admin/course-builder"
import { Spinner } from "@/components/ui/spinner"

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.slug as string
  const [course, setCourse] = useState<AdminCourseDetail | null>(null)
  const [instructors, setInstructors] = useState<AdminInstructorItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<AdminCourseDetail>(`/admin/courses/${courseSlug}`),
      api<AdminInstructorItem[]>("/admin/instructors"),
    ])
      .then(([c, i]) => {
        setCourse(c)
        setInstructors(i)
      })
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

  return (
    <CourseBuilder mode="edit" initialCourse={course} instructors={instructors} />
  )
}

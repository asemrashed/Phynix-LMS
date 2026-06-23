"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AdminInstructorItem } from "@fxprime/types"
import { CourseBuilder } from "@/components/admin/course-builder"

export default function NewCoursePage() {
  const [instructors, setInstructors] = useState<AdminInstructorItem[]>([])

  useEffect(() => {
    api<AdminInstructorItem[]>("/admin/instructors").then(setInstructors).catch(console.error)
  }, [])

  return <CourseBuilder mode="create" instructors={instructors} />
}

"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInstructorOverview } from "@/lib/hooks/use-instructor-data"
import {
  InstructorPanelError,
  InstructorPanelLoading,
} from "@/components/instructor/instructor-panel-state"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function InstructorCoursesPage() {
  const { data, loading, error, refetch } = useInstructorOverview()

  if (loading) return <InstructorPanelLoading />
  if (error || !data) {
    return <InstructorPanelError message={error ?? "Unable to load courses."} onRetry={refetch} />
  }

  const { courses } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="mt-1 text-muted-foreground">Courses assigned to you as instructor.</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>No courses yet</EmptyTitle>
              <EmptyDescription>
                An admin must assign you as instructor on a course.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-card p-6 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-semibold text-foreground">{course.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.enrollmentCount} enrolled · {course.level.toLowerCase()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-lg capitalize">
                  {course.status.toLowerCase()}
                </Badge>
                <Link href={`/instructor/courses/${course.slug}`}>
                  <Button variant="outline" className="rounded-xl">
                    Manage
                  </Button>
                </Link>
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Public Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

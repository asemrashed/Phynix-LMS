"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import {
  useInstructorCourseReviews,
  useInstructorCourseStudents,
} from "@/lib/hooks/use-instructor-data"
import type { InstructorCourseDetail } from "@fxprime/types"
import {
  InstructorPanelError,
  InstructorPanelLoading,
} from "@/components/instructor/instructor-panel-state"

export default function InstructorCourseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [course, setCourse] = useState<InstructorCourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentPage, setStudentPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  const studentsQuery = useInstructorCourseStudents(slug, studentPage, search)
  const reviewsQuery = useInstructorCourseReviews(slug)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api<InstructorCourseDetail>(`/instructor/courses/${slug}`)
      .then(setCourse)
      .catch(() => setError("Course not found or you are not assigned as instructor."))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    setStudentPage(1)
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  if (loading) return <InstructorPanelLoading />

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <InstructorPanelError message={error ?? "Course not found."} />
      </div>
    )
  }

  const studentTotalPages = studentsQuery.data
    ? Math.max(1, Math.ceil(studentsQuery.data.total / studentsQuery.data.limit))
    : 1

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/instructor/courses"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {course.enrollmentCount} enrolled · {course.level.toLowerCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-lg capitalize">
              {course.status.toLowerCase()}
            </Badge>
            <Link href={`/courses/${course.slug}`}>
              <Button variant="outline" className="rounded-xl">
                View Public Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <Users className="mb-2 h-5 w-5 text-primary" />
          <p className="text-2xl font-bold">{course.enrollmentCount}</p>
          <p className="text-sm text-muted-foreground">Enrollments</p>
        </div>
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Avg progress</p>
          <p className="text-2xl font-bold">{course.avgProgress}%</p>
          <Progress value={course.avgProgress} className="mt-2 h-2" />
        </div>
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{course.completedCount}</p>
          <p className="text-sm text-muted-foreground">students finished</p>
        </div>
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <Star className="mb-2 h-5 w-5 fill-amber-400 text-amber-400" />
          <p className="text-2xl font-bold">
            {course.averageRating > 0 ? course.averageRating.toFixed(1) : "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            {course.reviewCount} review{course.reviewCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="students" className="rounded-[20px] bg-card p-6 shadow-sm">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="students" className="rounded-lg">
            Students
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg">
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0">
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="rounded-xl pl-9"
                placeholder="Search by name or student ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="rounded-xl">
              Search
            </Button>
          </form>

          {studentsQuery.loading ? (
            <InstructorPanelLoading />
          ) : studentsQuery.error ? (
            <InstructorPanelError message={studentsQuery.error} onRetry={studentsQuery.refetch} />
          ) : !studentsQuery.data || studentsQuery.data.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {search ? "No students match your search." : "No students enrolled yet."}
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {studentsQuery.data.students.map((student) => (
                  <li
                    key={student.enrollmentId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{student.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.studentId ? `ID ${student.studentId} · ` : ""}
                        Enrolled {new Date(student.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{student.progress}% complete</p>
                      {student.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Finished {new Date(student.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {studentTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {studentPage} of {studentTotalPages} · {studentsQuery.data.total} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl"
                      disabled={studentPage <= 1}
                      onClick={() => setStudentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl"
                      disabled={studentPage >= studentTotalPages}
                      onClick={() => setStudentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          {reviewsQuery.loading ? (
            <InstructorPanelLoading />
          ) : reviewsQuery.error ? (
            <InstructorPanelError message={reviewsQuery.error} onRetry={reviewsQuery.refetch} />
          ) : !reviewsQuery.data || reviewsQuery.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviewsQuery.data.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-border px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{review.studentName}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {review.rating}
                    </div>
                  </div>
                  {review.review && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.review}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

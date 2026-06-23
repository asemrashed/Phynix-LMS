"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Star } from "lucide-react"
import { api } from "@/lib/api"
import type { AdminCourseStudentsResponse, CourseReviewItem } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"

interface CourseAdminInsightsProps {
  courseId: string
  enrollmentCount: number
}

export function CourseAdminInsights({ courseId, enrollmentCount }: CourseAdminInsightsProps) {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [students, setStudents] = useState<AdminCourseStudentsResponse | null>(null)
  const [reviews, setReviews] = useState<CourseReviewItem[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    setLoadingStudents(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    api<AdminCourseStudentsResponse>(`/admin/courses/${courseId}/students?${params}`)
      .then(setStudents)
      .catch(() => setStudents(null))
      .finally(() => setLoadingStudents(false))
  }, [courseId, page, search])

  useEffect(() => {
    setLoadingReviews(true)
    api<CourseReviewItem[]>(`/admin/courses/${courseId}/reviews?limit=50`)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false))
  }, [courseId])

  const totalPages = students ? Math.max(1, Math.ceil(students.total / students.limit)) : 1

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <p>
          Grant enrollments from{" "}
          <Link href="/admin/users" className="font-medium text-foreground underline-offset-2 hover:underline">
            Users
          </Link>
          . Installment plans:{" "}
          <Link
            href="/admin/payments/installments"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Payments → Installments
          </Link>
          .
        </p>
      </div>

      <Tabs defaultValue="students" className="rounded-[20px] border bg-card p-6 shadow-sm">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="students" className="rounded-lg">
            Students ({enrollmentCount})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0">
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(searchInput)
            }}
          >
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

          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : !students || students.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {search ? "No students match your search." : "No students enrolled yet."}
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {students.students.map((student) => (
                  <li
                    key={student.enrollmentId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
                  >
                    <div>
                      <Link
                        href={`/admin/users/${student.studentUserId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {student.studentName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {student.studentId ? `ID ${student.studentId} · ` : ""}
                        Enrolled {new Date(student.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{student.progress}% complete</p>
                      {student.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Finished {new Date(student.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-xl border px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{review.studentName}</p>
                    <div className="flex items-center gap-1 text-sm text-amber-600">
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

"use client"

import Link from "next/link"
import { api } from "@/lib/api"
import type { AdminCourseItem } from "@fxprime/types"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-data-table"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { getMediaUrl } from "@/lib/media-url"
import { getApiErrorMessage } from "@/lib/api-errors"
import { useState } from "react"

const DEFAULT_COURSE_THUMBNAIL =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"

export default function AdminCoursesPage() {
  const { items: courses, total, page, pageSize, loading, setPage, setPageSize, setItems } =
    useAdminPaginatedList<AdminCourseItem>("/admin/courses")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const updateStatus = async (course: AdminCourseItem, status: string) => {
    setUpdatingId(course.id)
    const previous = courses
    setItems((prev) =>
      prev.map((c) =>
        c.id === course.id ? { ...c, status: status as AdminCourseItem["status"] } : c
      )
    )

    try {
      await api(`/admin/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      toast.success(`Course ${status.toLowerCase()}`)
    } catch (error) {
      setItems(previous)
      toast.error(getApiErrorMessage(error, "Failed to update course"))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Courses"
        actions={
          <>
            <Link href="/admin/courses/new">
              <Button className="rounded-xl">New Course</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="rounded-xl">
                Back
              </Button>
            </Link>
          </>
        }
      />

      <AdminDataTable
        loading={loading}
        data={courses}
        rowKey={(c) => c.id}
        emptyMessage="No courses yet. Create your first course."
        columns={[
          {
            key: "title",
            header: "Course",
            cell: (course) => (
              <div className="flex items-center gap-3">
                <img
                  src={
                    getMediaUrl(course.thumbnailUrl) || DEFAULT_COURSE_THUMBNAIL
                  }
                  alt=""
                  className="h-12 w-20 shrink-0 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    ৳{course.price.toLocaleString()} · {course.enrollmentCount} enrolled · {course.level}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (course) => <Badge variant="outline">{course.status}</Badge>,
          },
        ]}
        actions={(course) => (
          <>
            <Link href={`/admin/course/${course.slug}`}>
              <Button size="sm" variant="outline" className="rounded-xl">
                Edit
              </Button>
            </Link>
            {course.status !== "PUBLISHED" && (
              <Button
                size="sm"
                className="rounded-xl"
                disabled={updatingId === course.id}
                onClick={() => updateStatus(course, "PUBLISHED")}
              >
                Publish
              </Button>
            )}
            {course.status === "PUBLISHED" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={updatingId === course.id}
                onClick={() => updateStatus(course, "ARCHIVED")}
              >
                Hide
              </Button>
            )}
          </>
        )}
      />

      <AdminListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

"use client"

import Link from "next/link"
import { api } from "@/lib/api"
import type { AdminCourseReviewItem } from "@fxprime/types"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-data-table"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export default function AdminReviewsPage() {
  const { items, total, page, pageSize, loading, setPage, setPageSize, setItems, refetch } =
    useAdminPaginatedList<AdminCourseReviewItem>("/admin/reviews")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const setVisibility = async (item: AdminCourseReviewItem, isPublished: boolean) => {
    setUpdatingId(item.id)
    const previous = items
    setItems((prev) =>
      prev.map((review) => (review.id === item.id ? { ...review, isPublished } : review))
    )

    try {
      await api(`/admin/reviews/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished }),
      })
      toast.success(isPublished ? "Review is now visible on the homepage" : "Review hidden from homepage")
    } catch {
      setItems(previous)
      toast.error("Failed to update review")
    } finally {
      setUpdatingId(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return
    const previous = items
    setItems((prev) => prev.filter((review) => review.id !== id))

    try {
      await api(`/admin/reviews/${id}`, { method: "DELETE" })
      toast.success("Review deleted")
      await refetch()
    } catch {
      setItems(previous)
      toast.error("Failed to delete review")
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Student course reviews appear here for moderation. Only reviews marked as shown appear on the homepage."
      />

      <AdminDataTable
        loading={loading}
        data={items}
        rowKey={(item) => item.id}
        emptyMessage="No student reviews yet."
        columns={[
          {
            key: "student",
            header: "Student",
            cell: (item) => (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.isPublished ? "default" : "secondary"}>
                    {item.isPublished ? "Shown" : "Hidden"}
                  </Badge>
                  <span className="font-semibold">{item.studentName}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.courseName}</p>
                {item.review && (
                  <p className="mt-1 line-clamp-2 max-w-md text-sm text-muted-foreground">
                    &ldquo;{item.review}&rdquo;
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "rating",
            header: "Rating",
            cell: (item) => `${item.rating}/5`,
          },
          {
            key: "date",
            header: "Submitted",
            cell: (item) => new Date(item.createdAt).toLocaleDateString(),
          },
        ]}
        actions={(item) => (
          <>
            {item.isPublished ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={updatingId === item.id}
                onClick={() => setVisibility(item, false)}
              >
                <EyeOff className="mr-1.5 size-3.5" />
                Hide
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={updatingId === item.id}
                onClick={() => setVisibility(item, true)}
              >
                <Eye className="mr-1.5 size-3.5" />
                Show
              </Button>
            )}
            <Link href={`/admin/courses/${item.courseId}`}>
              <Button variant="outline" size="sm" className="rounded-xl">
                View course
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={() => remove(item.id)}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
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

"use client"

import Link from "next/link"
import { api } from "@/lib/api"
import type { TestimonialItem } from "@fxprime/types"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-data-table"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { toast } from "sonner"
import { useState } from "react"

export default function AdminTestimonialsPage() {
  const { items, total, page, pageSize, loading, setPage, setPageSize, setItems, refetch } =
    useAdminPaginatedList<TestimonialItem>("/admin/testimonials")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const togglePublish = async (item: TestimonialItem) => {
    setUpdatingId(item.id)
    const previous = items
    setItems((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, isPublished: !t.isPublished } : t))
    )

    try {
      await api(`/admin/testimonials/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !item.isPublished }),
      })
      toast.success(item.isPublished ? "Unpublished" : "Published")
    } catch {
      setItems(previous)
      toast.error("Failed to update")
    } finally {
      setUpdatingId(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return
    const previous = items
    setItems((prev) => prev.filter((t) => t.id !== id))

    try {
      await api(`/admin/testimonials/${id}`, { method: "DELETE" })
      toast.success("Deleted")
      await refetch()
    } catch {
      setItems(previous)
      toast.error("Failed to delete")
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        actions={
          <Link href="/admin/testimonials/new">
            <Button className="rounded-xl">Add Testimonial</Button>
          </Link>
        }
      />

      <AdminDataTable
        loading={loading}
        data={items}
        rowKey={(item) => item.id}
        emptyMessage="No testimonials yet. Add your first review."
        columns={[
          {
            key: "author",
            header: "Author",
            cell: (item) => (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant={item.isPublished ? "default" : "secondary"}>
                    {item.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="font-semibold">{item.authorName}</span>
                </div>
                <p className="mt-1 line-clamp-2 max-w-md text-sm text-muted-foreground">
                  {item.title || item.content || item.mediaUrl}
                </p>
              </div>
            ),
          },
          {
            key: "rating",
            header: "Rating",
            cell: (item) => (item.rating != null ? `${item.rating}/5` : "—"),
          },
        ]}
        actions={(item) => (
          <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={updatingId === item.id}
              onClick={() => togglePublish(item)}
            >
              {item.isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Link href={`/admin/testimonials/${item.id}`}>
              <Button variant="outline" size="sm" className="rounded-xl">
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={() => remove(item.id)}
            >
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

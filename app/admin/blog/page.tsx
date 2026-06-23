"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { AdminBlogCategoryItem, AdminBlogPostItem } from "@fxprime/types"
import { BlogCategoryManager } from "@/components/admin/blog-category-manager"
import { AdminListFilterSelect } from "@/components/admin/admin-list-filter-select"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { AdminListSearch } from "@/components/admin/admin-list-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { useUrlFilter } from "@/lib/use-admin-url-state"
import { BLOG_COVER_PLACEHOLDER, getBlogCoverUrl } from "@/lib/media-url"
import { toast } from "sonner"
import { format } from "date-fns"

const BLOG_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
]

function BlogThumbnail({ coverUrl, title }: { coverUrl: string | null; title: string }) {
  const [src, setSrc] = useState(() => getBlogCoverUrl(coverUrl))

  useEffect(() => {
    setSrc(getBlogCoverUrl(coverUrl))
  }, [coverUrl])

  return (
    <img
      src={src}
      alt={title}
      className="h-16 w-24 shrink-0 rounded-lg object-cover"
      onError={() =>
        setSrc((current) =>
          current === BLOG_COVER_PLACEHOLDER ? current : BLOG_COVER_PLACEHOLDER
        )
      }
    />
  )
}

export default function AdminBlogPage() {
  const [search, setSearch] = useUrlFilter("search")
  const [status, setStatus] = useUrlFilter("status", "all")
  const extraParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status !== "all" ? status : undefined,
    }),
    [search, status]
  )

  const { items: posts, total, page, pageSize, loading, setPage, setPageSize, setItems } =
    useAdminPaginatedList<AdminBlogPostItem>("/admin/blog", { extraParams })
  const [categories, setCategories] = useState<AdminBlogCategoryItem[]>([])

  useEffect(() => {
    api<AdminBlogCategoryItem[]>("/admin/blog/categories")
      .then(setCategories)
      .catch(console.error)
  }, [])

  const updateStatus = async (post: AdminBlogPostItem, nextStatus: string) => {
    const previous = posts
    setItems((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              status: nextStatus as AdminBlogPostItem["status"],
              isScheduled: nextStatus === "PUBLISHED" ? false : p.isScheduled,
            }
          : p
      )
    )

    try {
      await api(`/admin/blog/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, publishNow: nextStatus === "PUBLISHED" }),
      })
      toast.success(`Post ${nextStatus.toLowerCase()}`)
    } catch {
      setItems(previous)
      toast.error("Failed to update post")
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <div className="flex gap-2">
          <BlogCategoryManager categories={categories} onChange={setCategories} />
          <Link href="/admin/blog/new">
            <Button className="rounded-xl">New Post</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminListSearch
          value={search}
          onChange={setSearch}
          placeholder="Search posts…"
          className="flex-1 max-w-none"
        />
        <AdminListFilterSelect
          value={status}
          onChange={setStatus}
          options={BLOG_STATUS_OPTIONS}
          className="w-full sm:w-[160px]"
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-[20px] border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <BlogThumbnail coverUrl={post.coverUrl} title={post.title} />
                  <div className="min-w-0">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                    {post.category} · /{post.slug}
                    {post.publishedAt && (
                      <>
                        {" "}
                        ·{" "}
                        {post.isScheduled
                          ? `Scheduled ${format(new Date(post.publishedAt), "MMM d, yyyy HH:mm")}`
                          : format(new Date(post.publishedAt), "MMM d, yyyy")}
                      </>
                    )}
                  </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{post.status}</Badge>
                  {post.isScheduled && <Badge variant="secondary">Scheduled</Badge>}
                  {post.isPremium && <Badge>Premium</Badge>}
                  <Link href={`/admin/blog/${post.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      Edit
                    </Button>
                  </Link>
                  {post.status !== "PUBLISHED" && !post.isScheduled && (
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => updateStatus(post, "PUBLISHED")}
                    >
                      Publish
                    </Button>
                  )}
                  {post.status === "PUBLISHED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => updateStatus(post, "ARCHIVED")}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-sm text-muted-foreground">No blog posts yet.</p>
            )}
          </div>

          <AdminListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  )
}

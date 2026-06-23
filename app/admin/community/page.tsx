"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import type { AdminCommunityFilter, AdminCommunityPostItem } from "@fxprime/types"
import {
  AdminCommunityPostCard,
  AdminCommunityPostCardSkeleton,
} from "@/components/admin/admin-community-post-card"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { AdminListSearch } from "@/components/admin/admin-list-search"
import { AdminPageHeader } from "@/components/admin/admin-data-table"
import type { CommunityModerationPatch } from "@/components/admin/community-moderation-actions"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import {
  ExternalLink,
  EyeOff,
  Flag,
  LayoutGrid,
  Megaphone,
  MessagesSquare,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

const FILTERS: {
  value: AdminCommunityFilter
  label: string
  icon: typeof LayoutGrid
  description: string
}[] = [
  { value: "all", label: "All", icon: LayoutGrid, description: "Every community thread" },
  {
    value: "reported",
    label: "Reported",
    icon: Flag,
    description: "Posts flagged by students",
  },
  {
    value: "hidden",
    label: "Hidden",
    icon: EyeOff,
    description: "Posts hidden from the feed",
  },
  {
    value: "deleted",
    label: "Deleted",
    icon: Trash2,
    description: "Soft-deleted posts",
  },
]

function parseFilter(value: string | null): AdminCommunityFilter {
  return FILTERS.some((f) => f.value === value) ? (value as AdminCommunityFilter) : "all"
}

function resultRange(page: number, pageSize: number, total: number) {
  if (total === 0) return "No posts"
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return `${start}–${end} of ${total}`
}

export default function AdminCommunityPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<AdminCommunityFilter>(() =>
    parseFilter(searchParams.get("filter"))
  )
  const [search, setSearch] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCommunityPostItem | null>(null)

  const extraParams = useMemo(
    () => ({
      filter: filter === "all" ? undefined : filter,
      search: search.trim() || undefined,
    }),
    [filter, search]
  )

  const { items: posts, total, page, pageSize, loading, setPage, setItems } =
    useAdminPaginatedList<AdminCommunityPostItem>("/admin/community", { extraParams })

  const activeFilterMeta = FILTERS.find((f) => f.value === filter) ?? FILTERS[0]

  const setFilterAndUrl = useCallback(
    (value: AdminCommunityFilter) => {
      setFilter(value)
      const params = new URLSearchParams(searchParams.toString())
      if (value === "all") params.delete("filter")
      else params.set("filter", value)
      params.delete("page")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const applyModeration = async (
    post: AdminCommunityPostItem,
    patch: CommunityModerationPatch,
    successMessage: string
  ) => {
    setUpdatingId(post.id)
    const previous = posts
    setItems((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, ...patch } : p))
    )

    try {
      await api(`/admin/community/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
      toast.success(successMessage)
    } catch {
      setItems(previous)
      toast.error("Failed to update post")
    } finally {
      setUpdatingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const post = deleteTarget
    setDeleteTarget(null)
    await applyModeration(post, { isDeleted: true }, "Post deleted")
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Community Moderation"
        description="Review reports, hide or restore posts, and publish official announcements"
        actions={
          <>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/dashboard/community" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View feed
              </Link>
            </Button>
            <Button className="rounded-xl" asChild>
              <Link href="/admin/community/new">
                <Megaphone className="mr-2 h-4 w-4" />
                New announcement
              </Link>
            </Button>
          </>
        }
      />

      <div className="rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminListSearch
            value={search}
            onChange={setSearch}
            placeholder="Search title, author, or content…"
            className="max-w-none flex-1"
            inputClassName="bg-background"
          />
          <Tabs
            value={filter}
            onValueChange={(value) => setFilterAndUrl(value as AdminCommunityFilter)}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1 sm:flex sm:w-auto">
              {FILTERS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{activeFilterMeta.description}</span>
            {!loading && (
              <span className="ml-2 text-xs">· {resultRange(page, pageSize, total)}</span>
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminCommunityPostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <MessagesSquare className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h2 className="mt-4 text-lg font-semibold">No posts found</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {search.trim()
              ? "Try a different search term or clear filters."
              : filter === "reported"
                ? "No reported posts — the community looks clean."
                : "Nothing matches this filter yet."}
          </p>
          {(search.trim() || filter !== "all") && (
            <Button
              variant="outline"
              className="mt-6 rounded-xl"
              onClick={() => {
                setSearch("")
                setFilterAndUrl("all")
              }}
            >
              Clear filters
            </Button>
          )}
          {filter === "all" && !search.trim() && (
            <Button className="mt-6 rounded-xl" asChild>
              <Link href="/admin/community/new">Publish announcement</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <AdminCommunityPostCard
              key={post.id}
              post={post}
              busy={updatingId === post.id}
              onModerate={(patch, message) => applyModeration(post, patch, message)}
              onDeleteRequest={() => setDeleteTarget(post)}
            />
          ))}
        </div>
      )}

      <AdminListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title
                ? `"${deleteTarget.title}" will be hidden from the community feed. You can restore it later from the Deleted filter.`
                : "This post will be hidden from the community feed. You can restore it later from the Deleted filter."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <Button variant="destructive" className="rounded-xl" onClick={confirmDelete}>
              Delete post
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

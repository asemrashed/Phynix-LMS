"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api"
import type {
  AdminCommunityCommentItem,
  AdminCommunityPostDetail,
  AdminCommunityPostItem,
  AdminCommunityReportItem,
} from "@fxprime/types"
import {
  CommunityModerationActions,
  CommunityPostBadges,
  type CommunityModerationPatch,
} from "@/components/admin/community-moderation-actions"
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Flag,
  Heart,
  MessageSquare,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function AuthorAvatar({
  name,
  official,
  size = "md",
}: {
  name: string
  official?: boolean
  size?: "sm" | "md"
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-white font-semibold shadow-sm",
        size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm",
        official && "border-primary/20 bg-primary/5 text-primary"
      )}
      aria-hidden
    >
      {authorInitials(name)}
    </div>
  )
}

function MetaChip({
  icon: Icon,
  children,
  className,
}: {
  icon: typeof Calendar
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white px-3 py-1 text-xs text-muted-foreground",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  )
}

function ReplyCard({
  reply,
  updatingId,
  onModerate,
  onDeleteRequest,
  depth = 0,
}: {
  reply: AdminCommunityCommentItem
  updatingId: string | null
  onModerate: (
    post: AdminCommunityPostItem,
    patch: CommunityModerationPatch,
    message: string
  ) => void
  onDeleteRequest: (post: AdminCommunityPostItem) => void
  depth?: number
}) {
  const busy = updatingId === reply.id
  const relativeTime = formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })

  const handleModerate = (patch: CommunityModerationPatch, message: string) => {
    if (patch.isDeleted === true) {
      onDeleteRequest(reply)
      return
    }
    onModerate(reply, patch, message)
  }

  return (
    <div className={cn(depth > 0 && "ml-4 sm:ml-8")}>
      <article className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
        <div className="flex gap-3 p-4 sm:p-5">
          <AuthorAvatar name={reply.authorName} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-foreground">{reply.authorName}</span>
              <span className="text-xs text-muted-foreground">· {relativeTime}</span>
              {reply.likes > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  · <Heart className="h-3 w-3" />
                  {reply.likes}
                </span>
              )}
            </div>
            {(reply.isHidden || reply.isDeleted || reply.reportCount > 0) && (
              <div className="mt-2">
                <CommunityPostBadges post={reply} />
              </div>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {reply.content}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5">
          <CommunityModerationActions
            post={reply}
            busy={busy}
            showPin={false}
            onModerate={handleModerate}
          />
        </div>
      </article>
      {reply.children.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-primary/20 pl-3 sm:pl-4">
          {reply.children.map((child) => (
            <ReplyCard
              key={child.id}
              reply={child}
              updatingId={updatingId}
              onModerate={onModerate}
              onDeleteRequest={onDeleteRequest}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="-m-4 min-h-full animate-pulse bg-white md:-m-6 lg:-m-8">
      <div className="border-b border-border/60 px-4 py-4 md:px-8">
        <div className="h-9 w-40 rounded-lg bg-muted" />
      </div>
      <div className="mx-auto w-full max-w-full px-4 py-8 md:px-8">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-muted" />
        <div className="mt-4 flex gap-2">
          <div className="h-7 w-24 rounded-full bg-muted" />
          <div className="h-7 w-24 rounded-full bg-muted" />
        </div>
        <div className="mt-8 h-32 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

function ThreadSidebar({
  post,
  repliesCount,
  reportsCount,
  busy,
  onModerate,
}: {
  post: AdminCommunityPostItem
  repliesCount: number
  reportsCount: number
  busy: boolean
  onModerate: (patch: CommunityModerationPatch, message: string) => void
}) {
  const statusLabel = post.isDeleted
    ? "Deleted"
    : post.isHidden
      ? "Hidden"
      : post.isPinned
        ? "Pinned"
        : "Published"

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Moderation
        </h2>
        <Separator className="my-4" />
        <CommunityModerationActions
          post={post}
          busy={busy}
          showPin
          layout="stack"
          onModerate={onModerate}
        />
      </div>

      <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Thread stats
        </h2>
        <dl className="mt-4 divide-y divide-border/60 text-sm">
          {[
            { label: "Likes", value: post.likes },
            { label: "Replies", value: repliesCount },
            {
              label: "Reports",
              value: reportsCount,
              highlight: reportsCount > 0,
            },
            { label: "Status", value: statusLabel },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "font-medium",
                  row.highlight && "text-amber-700 dark:text-amber-400"
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}

export default function AdminCommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [thread, setThread] = useState<AdminCommunityPostDetail | null>(null)
  const [reports, setReports] = useState<AdminCommunityReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCommunityPostItem | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [detail, reportList] = await Promise.all([
        api<AdminCommunityPostDetail>(`/admin/community/${postId}`),
        api<AdminCommunityReportItem[]>(`/admin/community/${postId}/reports`),
      ])
      setThread(detail)
      setReports(reportList)
    } catch {
      toast.error("Failed to load post")
      router.push("/admin/community")
    } finally {
      setLoading(false)
    }
  }, [postId, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updatePostInState = (updated: AdminCommunityPostItem) => {
    const patchReplies = (items: AdminCommunityCommentItem[]): AdminCommunityCommentItem[] =>
      items.map((item) =>
        item.id === updated.id
          ? { ...item, ...updated, children: item.children }
          : { ...item, children: patchReplies(item.children) }
      )

    setThread((prev) => {
      if (!prev) return prev
      if (prev.post.id === updated.id) {
        return { ...prev, post: updated }
      }
      return {
        ...prev,
        replies: patchReplies(prev.replies),
      }
    })
  }

  const moderate = async (
    post: AdminCommunityPostItem,
    patch: CommunityModerationPatch,
    successMessage: string
  ) => {
    setUpdatingId(post.id)
    try {
      const updated = await api<AdminCommunityPostItem>(`/admin/community/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
      updatePostInState(updated)
      toast.success(successMessage)
    } catch {
      toast.error("Failed to update post")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMainModerate = (patch: CommunityModerationPatch, message: string) => {
    if (!thread) return
    if (patch.isDeleted === true) {
      setDeleteTarget(thread.post)
      return
    }
    moderate(thread.post, patch, message)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const post = deleteTarget
    setDeleteTarget(null)
    await moderate(post, { isDeleted: true }, "Post deleted")
  }

  if (loading) return <DetailSkeleton />
  if (!thread) return null

  const { post, replies } = thread
  const postBusy = updatingId === post.id
  const postedAt = format(new Date(post.createdAt), "d MMM yyyy, h:mm a")

  return (
    <div className="-m-4 min-h-full bg-white md:-m-6 lg:-m-8">
      <div className="border-b border-border/60 bg-white px-4 py-3 md:px-8">
        <div className="mx-auto flex w-full max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="-ml-2 w-fit rounded-xl" asChild>
            <Link href="/admin/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to moderation
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            {!post.isDeleted && !post.isHidden && (
              <Button variant="outline" size="sm" className="rounded-xl bg-white" asChild>
                <Link href={`/dashboard/community?post=${post.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on feed
                </Link>
              </Button>
            )}
            {!post.parentId && (
              <Button variant="outline" size="sm" className="rounded-xl bg-white" asChild>
                <Link href={`/admin/community/${post.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-full gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 bg-white px-4 py-6 md:px-8 lg:border-r lg:border-border/60 lg:py-8">
          <CommunityPostBadges post={post} />
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {post.title?.trim() || "Community post"}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <MetaChip icon={Calendar}>{postedAt}</MetaChip>
            <MetaChip icon={Heart}>{post.likes} likes</MetaChip>
            <MetaChip icon={MessageSquare}>
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </MetaChip>
            {reports.length > 0 && (
              <MetaChip icon={Flag} className="border-amber-500/30 text-amber-800">
                {reports.length} {reports.length === 1 ? "report" : "reports"}
              </MetaChip>
            )}
            <span className="inline-flex items-center rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-foreground">
              {post.authorName}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-border/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex gap-4">
              <AuthorAvatar name={post.authorName} official={post.isOfficial} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{post.authorName}</p>
                <p className="text-xs text-muted-foreground">Original post</p>
                <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:hidden">
            <ThreadSidebar
              post={post}
              repliesCount={replies.length}
              reportsCount={reports.length}
              busy={postBusy}
              onModerate={handleMainModerate}
            />
          </div>

          {reports.length > 0 && (
            <section className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-50/50 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold">Reports ({reports.length})</h2>
              </div>
              <div className="mt-4 space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-border/60 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-medium">{report.reporterName}</p>
                      <Badge variant="outline" className="rounded-lg bg-white text-xs">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.reporterEmail}</p>
                    <p className="mt-2 text-sm text-foreground">
                      {report.reason || "No reason provided"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Replies</h2>
              <Badge variant="secondary" className="rounded-lg">
                {replies.length}
              </Badge>
            </div>
            {replies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-white px-6 py-12 text-center text-sm text-muted-foreground">
                No replies on this thread yet.
              </div>
            ) : (
              <div className="space-y-3">
                {replies.map((reply) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    updatingId={updatingId}
                    onModerate={moderate}
                    onDeleteRequest={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="hidden bg-white px-4 py-8 md:px-6 lg:block lg:sticky lg:top-0 lg:self-start lg:px-6">
          <ThreadSidebar
            post={post}
            repliesCount={replies.length}
            reportsCount={reports.length}
            busy={postBusy}
            onModerate={handleMainModerate}
          />
        </div>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this {deleteTarget?.parentId ? "reply" : "post"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden from the community feed. You can restore it later from the Deleted
              filter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <Button variant="destructive" className="rounded-xl" onClick={confirmDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

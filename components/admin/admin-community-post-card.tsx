"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { AdminCommunityPostItem } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import {
  CommunityModerationActions,
  CommunityPostBadges,
  type CommunityModerationPatch,
} from "@/components/admin/community-moderation-actions"
import { cn } from "@/lib/utils"
import { Heart, MessageSquare, Megaphone } from "lucide-react"

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function postAccentClass(post: AdminCommunityPostItem) {
  if (post.isDeleted) return "border-l-destructive/60"
  if (post.reportCount > 0) return "border-l-amber-500"
  if (post.isHidden) return "border-l-muted-foreground/40"
  if (post.isOfficial) return "border-l-primary"
  return "border-l-transparent"
}

interface AdminCommunityPostCardProps {
  post: AdminCommunityPostItem
  busy?: boolean
  onModerate: (patch: CommunityModerationPatch, message: string) => void
  onDeleteRequest?: () => void
}

export function AdminCommunityPostCard({
  post,
  busy = false,
  onModerate,
  onDeleteRequest,
}: AdminCommunityPostCardProps) {
  const isReply = Boolean(post.parentId)
  const displayTitle = post.title?.trim() || (isReply ? "Reply" : "Untitled post")
  const relativeTime = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  const handleModerate = (patch: CommunityModerationPatch, message: string) => {
    if (patch.isDeleted === true && onDeleteRequest) {
      onDeleteRequest()
      return
    }
    onModerate(patch, message)
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        "border-l-4",
        postAccentClass(post)
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                post.isOfficial
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
              aria-hidden
            >
              {post.isOfficial ? (
                <Megaphone className="h-4 w-4" />
              ) : (
                authorInitials(post.authorName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CommunityPostBadges post={post} />
              <Link
                href={`/admin/community/${post.id}`}
                className="mt-2 block font-bold leading-snug text-foreground hover:text-primary"
              >
                {displayTitle}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.authorName} · {relativeTime}
              </p>
            </div>
          </div>

          <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {post.content}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likes} likes
            </span>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-auto lg:min-w-[200px]">
          <Button variant="outline" className="min-h-10 w-full rounded-xl lg:w-auto" asChild>
            <Link href={`/admin/community/${post.id}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Review
            </Link>
          </Button>
          <CommunityModerationActions
            post={post}
            busy={busy}
            showPin={!isReply}
            responsive
            onModerate={handleModerate}
          />
        </div>
      </div>
    </article>
  )
}

export function AdminCommunityPostCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[20px] border border-border bg-card p-6 shadow-sm">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-5 w-3/4 max-w-sm rounded bg-muted" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
    </div>
  )
}

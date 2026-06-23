"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { AdminCommunityPostItem } from "@fxprime/types"
import { Eye, EyeOff, Flag, Megaphone, MoreHorizontal, Pin, RotateCcw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type CommunityModerationPatch = {
  isHidden?: boolean
  isPinned?: boolean
  isDeleted?: boolean
}

interface CommunityModerationActionsProps {
  post: AdminCommunityPostItem
  busy?: boolean
  showPin?: boolean
  responsive?: boolean
  layout?: "inline" | "stack"
  onModerate: (patch: CommunityModerationPatch, successMessage: string) => void
}

function InlineModerationButtons({
  post,
  busy,
  showPin,
  onModerate,
  className,
  stacked = false,
}: CommunityModerationActionsProps & { className?: string; stacked?: boolean }) {
  const btnClass = cn(
    stacked ? "min-h-10 w-full justify-center rounded-xl" : "min-h-11 rounded-xl sm:min-h-0",
    className
  )

  if (post.isDeleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={btnClass}
        disabled={busy}
        onClick={() => onModerate({ isDeleted: false }, "Post restored")}
      >
        <RotateCcw className="mr-1 h-4 w-4" />
        Restore
      </Button>
    )
  }

  return (
    <>
      {showPin && (
        <Button
          variant="outline"
          size="sm"
          className={btnClass}
          disabled={busy}
          onClick={() =>
            onModerate(
              { isPinned: !post.isPinned },
              post.isPinned ? "Post unpinned" : "Post pinned"
            )
          }
        >
          <Pin className="mr-1 h-4 w-4" />
          {post.isPinned ? "Unpin" : "Pin"}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className={btnClass}
        disabled={busy}
        onClick={() =>
          onModerate(
            { isHidden: !post.isHidden },
            post.isHidden ? "Post visible again" : "Post hidden"
          )
        }
      >
        {post.isHidden ? (
          <>
            <Eye className="mr-1 h-4 w-4" />
            Show
          </>
        ) : (
          <>
            <EyeOff className="mr-1 h-4 w-4" />
            Hide
          </>
        )}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className={btnClass}
        disabled={busy}
        onClick={() => onModerate({ isDeleted: true }, "Post deleted")}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        Delete
      </Button>
    </>
  )
}

function MobileModerationSheet({
  post,
  busy,
  showPin,
  onModerate,
}: CommunityModerationActionsProps) {
  const [open, setOpen] = useState(false)

  const run = (patch: CommunityModerationPatch, message: string) => {
    setOpen(false)
    onModerate(patch, message)
  }

  if (post.isDeleted) {
    return (
      <Button
        variant="outline"
        className="min-h-11 w-full rounded-xl"
        disabled={busy}
        onClick={() => onModerate({ isDeleted: false }, "Post restored")}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Restore post
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="min-h-11 w-full rounded-xl" disabled={busy}>
          <MoreHorizontal className="mr-2 h-4 w-4" />
          More actions
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[20px]">
        <SheetHeader>
          <SheetTitle>Moderate post</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          {showPin && (
            <Button
              variant="outline"
              className="min-h-11 w-full justify-start rounded-xl"
              disabled={busy}
              onClick={() =>
                run(
                  { isPinned: !post.isPinned },
                  post.isPinned ? "Post unpinned" : "Post pinned"
                )
              }
            >
              <Pin className="mr-2 h-4 w-4" />
              {post.isPinned ? "Unpin from community" : "Pin to top"}
            </Button>
          )}
          <Button
            variant="outline"
            className="min-h-11 w-full justify-start rounded-xl"
            disabled={busy}
            onClick={() =>
              run(
                { isHidden: !post.isHidden },
                post.isHidden ? "Post visible again" : "Post hidden"
              )
            }
          >
            {post.isHidden ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show in community
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide from community
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            className="min-h-11 w-full justify-start rounded-xl"
            disabled={busy}
            onClick={() => run({ isDeleted: true }, "Post deleted")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete post
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function CommunityModerationActions({
  post,
  busy = false,
  showPin = true,
  responsive = false,
  layout = "inline",
  onModerate,
}: CommunityModerationActionsProps) {
  if (layout === "stack") {
    return (
      <div className="flex w-full flex-col gap-2">
        <InlineModerationButtons
          post={post}
          busy={busy}
          showPin={showPin}
          onModerate={onModerate}
          className="w-full"
          stacked
        />
      </div>
    )
  }

  if (!responsive) {
    return (
      <InlineModerationButtons
        post={post}
        busy={busy}
        showPin={showPin}
        onModerate={onModerate}
      />
    )
  }

  return (
    <>
      <div className="hidden flex-wrap gap-2 sm:flex">
        <InlineModerationButtons
          post={post}
          busy={busy}
          showPin={showPin}
          onModerate={onModerate}
        />
      </div>
      <div className="sm:hidden">
        <MobileModerationSheet
          post={post}
          busy={busy}
          showPin={showPin}
          onModerate={onModerate}
        />
      </div>
    </>
  )
}

export function CommunityPostBadges({ post }: { post: AdminCommunityPostItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {post.isOfficial && (
        <Badge className="gap-1 rounded-lg">
          <Megaphone className="h-3 w-3" />
          Official
        </Badge>
      )}
      {post.isPinned && (
        <Badge variant="secondary" className="gap-1 rounded-lg">
          <Pin className="h-3 w-3" />
          Pinned
        </Badge>
      )}
      {post.isHidden && (
        <Badge variant="secondary" className="gap-1 rounded-lg bg-muted text-muted-foreground">
          <EyeOff className="h-3 w-3" />
          Hidden
        </Badge>
      )}
      {post.isDeleted && (
        <Badge variant="destructive" className="gap-1 rounded-lg">
          <Trash2 className="h-3 w-3" />
          Deleted
        </Badge>
      )}
      {post.reportCount > 0 && (
        <Badge
          variant="outline"
          className="gap-1 rounded-lg border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
        >
          <Flag className="h-3 w-3" />
          {post.reportCount} {post.reportCount === 1 ? "report" : "reports"}
        </Badge>
      )}
    </div>
  )
}

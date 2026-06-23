"use client"

import { useState } from "react"
import type { CommunityCommentItem, CommunityReactionType } from "@fxprime/types"
import { AuthorAvatar } from "@/components/community/author-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ReactionBar } from "@/components/community/reaction-bar"
import {
  communityActionClass,
  communityDangerActionClass,
  formatCommunityDate,
} from "@/lib/community-utils"
import { Flag, MessageCircle, Send, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentThreadProps {
  comments: CommunityCommentItem[]
  rootPostId: string
  depth?: number
  userLoggedIn: boolean
  submitting: boolean
  onReact: (postId: string, type: CommunityReactionType) => void
  onReply: (rootPostId: string, content: string, parentId: string) => Promise<void>
  onDelete: (postId: string) => void
  onReport: (postId: string) => void
}

function CommentItem({
  comment,
  rootPostId,
  depth,
  userLoggedIn,
  submitting,
  onReact,
  onReply,
  onDelete,
  onReport,
}: {
  comment: CommunityCommentItem
  rootPostId: string
} & Omit<CommentThreadProps, "comments">) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")

  const handleReply = async () => {
    if (!replyText.trim()) return
    await onReply(rootPostId, replyText.trim(), comment.id)
    setReplyText("")
    setReplyOpen(false)
  }

  return (
    <div className={cn(depth > 0 && "ml-10 border-l-2 border-primary/20 pl-5 sm:ml-12")}>
      <div className="flex gap-3">
        <AuthorAvatar name={comment.authorName} size="md" className="mt-0.5" />

        <div className="min-w-0 max-w-3xl flex-1">
          <div className="rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
              <span
                className="text-xs text-muted-foreground"
                title={new Date(comment.createdAt).toLocaleString()}
              >
                {formatCommunityDate(comment.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <ReactionBar post={comment} onReact={onReact} compact />
            {userLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                className={communityActionClass}
                onClick={() => setReplyOpen((v) => !v)}
              >
                Reply
              </Button>
            )}
            {comment.isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className={communityDangerActionClass}
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            {!comment.isOwner && userLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                className={communityActionClass}
                onClick={() => onReport(comment.id)}
              >
                <Flag className="mr-1.5 h-3.5 w-3.5" />
                Report
              </Button>
            )}
          </div>

          {replyOpen && userLoggedIn && (
            <div className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-3">
              <Textarea
                className="min-h-[72px] rounded-lg border-border/80 bg-background text-sm"
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.authorName}...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void handleReply()
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Ctrl+Enter to post</span>
                <Button
                  size="sm"
                  className="rounded-lg"
                  disabled={submitting || !replyText.trim()}
                  onClick={handleReply}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.children.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              rootPostId={rootPostId}
              depth={(depth ?? 0) + 1}
              userLoggedIn={userLoggedIn}
              submitting={submitting}
              onReact={onReact}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentThread({
  comments,
  rootPostId,
  userLoggedIn,
  submitting,
  onReact,
  onReply,
  onDelete,
  onReport,
}: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <p className="font-medium text-foreground">No comments yet</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Start the conversation — share your take on this post.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          rootPostId={rootPostId}
          depth={0}
          userLoggedIn={userLoggedIn}
          submitting={submitting}
          onReact={onReact}
          onReply={onReply}
          onDelete={onDelete}
          onReport={onReport}
        />
      ))}
    </div>
  )
}

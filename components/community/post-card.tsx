"use client"

import { useState } from "react"
import type { CommunityFeedPostItem, CommunityReactionType } from "@fxprime/types"
import { AuthorAvatar } from "@/components/community/author-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ReactionBar } from "@/components/community/reaction-bar"
import { formatCommunityDate } from "@/lib/community-utils"
import { ArrowRight, MessageSquare, Pin, Send, ShieldCheck } from "lucide-react"

interface CommunityPostCardProps {
  post: CommunityFeedPostItem
  onReact: (postId: string, type: CommunityReactionType) => void
  onOpenThread: (postId: string) => void
  onQuickComment?: (postId: string, content: string) => Promise<void>
  userLoggedIn: boolean
  submitting?: boolean
}

export function CommunityPostCard({
  post,
  onReact,
  onOpenThread,
  onQuickComment,
  userLoggedIn,
  submitting,
}: CommunityPostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState("")

  const handleQuickComment = async () => {
    if (!onQuickComment || !commentText.trim()) return
    await onQuickComment(post.id, commentText.trim())
    setCommentText("")
    setCommentsOpen(true)
  }

  return (
    <article className="overflow-hidden rounded-[20px] border border-border/50 bg-card shadow-sm transition-all hover:border-border hover:shadow-md">
      <div className="cursor-pointer px-6 pb-4 pt-5" onClick={() => onOpenThread(post.id)}>
        <div className="flex gap-4">
          <AuthorAvatar name={post.authorName} size="md" />

          <div className="min-w-0 max-w-3xl flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{post.authorName}</span>
              {post.isOfficial && (
                <Badge className="gap-1 rounded-full px-2 py-0 text-[10px] uppercase tracking-wide">
                  <ShieldCheck className="h-3 w-3" />
                  Official
                </Badge>
              )}
              {post.isPinned && (
                <Badge variant="secondary" className="gap-1 rounded-full">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
            <p
              className="mt-0.5 text-xs text-muted-foreground"
              title={new Date(post.createdAt).toLocaleString()}
            >
              {formatCommunityDate(post.createdAt)}
            </p>

            <h3 className="mt-3 font-sans text-lg font-bold leading-snug text-foreground">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-2 border-t border-border/50 bg-muted/20 px-6 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <ReactionBar post={post} onReact={onReact} />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => setCommentsOpen((v) => !v)}
        >
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
          {post.replyCount} {post.replyCount === 1 ? "comment" : "comments"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 rounded-lg px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onOpenThread(post.id)}
        >
          View thread
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      {commentsOpen && (
        <div className="border-t border-border/50 px-6 py-4" onClick={(e) => e.stopPropagation()}>
          {post.previewComments.length > 0 && (
            <div className="mb-4 max-w-3xl space-y-2">
              {post.previewComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-2.5 rounded-xl border border-border/40 bg-background px-3 py-2.5"
                >
                  <AuthorAvatar name={comment.authorName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{comment.authorName}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
              {post.replyCount > post.previewComments.length && (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => onOpenThread(post.id)}
                >
                  View all {post.replyCount} comments
                </button>
              )}
            </div>
          )}

          {userLoggedIn && onQuickComment && (
            <div className="flex max-w-3xl gap-2.5">
              <Textarea
                className="min-h-[72px] flex-1 rounded-xl border-border/80 bg-muted/30 text-sm focus-visible:bg-background"
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void handleQuickComment()
                  }
                }}
              />
              <Button
                size="sm"
                className="self-end rounded-xl"
                disabled={submitting || !commentText.trim()}
                onClick={handleQuickComment}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Comment
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

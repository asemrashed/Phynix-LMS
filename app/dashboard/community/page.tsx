"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AuthorAvatar } from "@/components/community/author-avatar"
import { CommentThread } from "@/components/community/comment-thread"
import { CommunityPostCard } from "@/components/community/post-card"
import { ReactionBar } from "@/components/community/reaction-bar"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  communityActionClass,
  communityDangerActionClass,
  formatCommunityDate,
  updatePostReactionInFeed,
  updateReactionInComments,
} from "@/lib/community-utils"
import type {
  CommunityFeedPostItem,
  CommunityPostDetail,
  CommunityReactionType,
  CommunityReactResult,
} from "@fxprime/types"
import {
  ArrowLeft,
  Flag,
  MessageSquare,
  Pencil,
  Pin,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

export default function CommunityPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<CommunityFeedPostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [thread, setThread] = useState<CommunityPostDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api<{ posts: CommunityFeedPostItem[] }>("/community")
      setPosts(data.posts)
    } catch {
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchThread = useCallback(async (postId: string) => {
    setThreadLoading(true)
    try {
      const data = await api<CommunityPostDetail>(`/community/${postId}`)
      setThread(data)
      setEditTitle(data.post.title || "")
      setEditContent(data.post.content)
    } catch {
      toast.error("Failed to load thread")
      setSelectedId(null)
    } finally {
      setThreadLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const postId = searchParams.get("post")
    if (postId) setSelectedId(postId)
  }, [searchParams])

  useEffect(() => {
    if (selectedId) fetchThread(selectedId)
    else setThread(null)
  }, [selectedId, fetchThread])

  const applyReaction = (result: CommunityReactResult) => {
    setPosts((prev) => updatePostReactionInFeed(prev, result))
    setThread((t) => {
      if (!t) return t
      if (t.post.id === result.id) {
        return {
          ...t,
          post: {
            ...t.post,
            likes: result.likes,
            likedByMe: result.likedByMe,
            myReaction: result.myReaction,
            reactions: result.reactions,
          },
        }
      }
      return {
        ...t,
        replies: updateReactionInComments(t.replies, result),
      }
    })
  }

  const handleReact = async (postId: string, type: CommunityReactionType) => {
    if (!user) {
      toast.error("Sign in to react")
      return
    }
    try {
      const result = await api<CommunityReactResult>(`/community/${postId}/react`, {
        method: "POST",
        body: JSON.stringify({ type }),
      })
      applyReaction(result)
    } catch {
      toast.error("Failed to update reaction")
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      await api("/community", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      })
      setTitle("")
      setContent("")
      setShowForm(false)
      await fetchPosts()
      toast.success("Post published!")
    } catch {
      toast.error("Failed to create post")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (
    rootPostId: string,
    text: string,
    parentId?: string
  ) => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await api(`/community/${rootPostId}/replies`, {
        method: "POST",
        body: JSON.stringify({
          content: text.trim(),
          ...(parentId ? { parentId } : {}),
        }),
      })
      if (selectedId === rootPostId) {
        setReplyContent("")
        await fetchThread(rootPostId)
      }
      await fetchPosts()
      toast.success(parentId ? "Reply posted!" : "Comment posted!")
    } catch {
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickComment = async (postId: string, text: string) => {
    await handleReply(postId, text)
  }

  const handleEdit = async () => {
    if (!selectedId || !thread) return
    setSubmitting(true)
    try {
      await api(`/community/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      })
      setEditing(false)
      await fetchThread(selectedId)
      await fetchPosts()
      toast.success("Post updated")
    } catch {
      toast.error("Failed to update post")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return
    try {
      await api(`/community/${postId}`, { method: "DELETE" })
      if (selectedId === postId) setSelectedId(null)
      await fetchPosts()
      toast.success("Post deleted")
    } catch {
      toast.error("Failed to delete post")
    }
  }

  const handleReport = async (postId: string) => {
    const reason = prompt("Reason for report (optional):") ?? undefined
    try {
      await api(`/community/${postId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      })
      toast.success("Report submitted — thank you")
    } catch {
      toast.error("Failed to submit report")
    }
  }

  if (selectedId && thread) {
    const { post, replies, replyCount } = thread
    const userName = user?.student
      ? `${user.student.firstName} ${user.student.lastName}`
      : user?.email ?? "You"

    const submitComment = () => {
      if (replyContent.trim()) void handleReply(post.id, replyContent)
    }

    return (
      <div className="mx-auto max-w-full space-y-6">
        <Button
          variant="ghost"
          className="-ml-2 rounded-xl text-muted-foreground hover:text-foreground"
          onClick={() => setSelectedId(null)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to community
        </Button>

        {threadLoading ? (
          <p className="text-muted-foreground">Loading thread...</p>
        ) : (
          <>
            <article className="overflow-hidden rounded-[20px] border border-border/50 bg-card shadow-sm">
              <div className="border-b border-primary/15 bg-linear-to-r from-primary/5 via-primary/2 to-transparent px-6 py-5">
                <div className="flex gap-4">
                  <AuthorAvatar name={post.authorName} size="lg" />
                  <div className="min-w-0 max-w-3xl flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-foreground">{post.authorName}</span>
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
                      className="mt-0.5 text-sm text-muted-foreground"
                      title={new Date(post.createdAt).toLocaleString()}
                    >
                      {formatCommunityDate(post.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                {editing ? (
                  <div className="max-w-3xl space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        className="mt-1 rounded-xl"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        className="mt-1 rounded-xl"
                        rows={6}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="rounded-xl" onClick={handleEdit} disabled={submitting}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl">
                    <h1 className="font-sans text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
                      {post.title}
                    </h1>
                    <p className="mt-4 text-[15px] leading-7 text-foreground/90 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}
              </div>

              {!editing && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border/50 bg-muted/20 px-6 py-3">
                  <ReactionBar post={post} onReact={handleReact} />
                  <div className="ml-auto flex flex-wrap items-center gap-1">
                    {post.isOwner && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={communityActionClass}
                          onClick={() => setEditing(true)}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={communityDangerActionClass}
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </>
                    )}
                    {!post.isOwner && user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={communityActionClass}
                        onClick={() => handleReport(post.id)}
                      >
                        <Flag className="mr-1.5 h-3.5 w-3.5" />
                        Report
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </article>

            <section className="overflow-hidden rounded-[20px] border border-border/50 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-6 py-4">
                <h2 className="flex items-center gap-2 font-semibold text-foreground">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {replyCount} {replyCount === 1 ? "Comment" : "Comments"}
                </h2>
              </div>
              <div className="px-6 py-5">
                <CommentThread
                  comments={replies}
                  rootPostId={post.id}
                  userLoggedIn={!!user}
                  submitting={submitting}
                  onReact={handleReact}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  onReport={handleReport}
                />
              </div>
            </section>

            {user && (
              <div className="sticky bottom-4 z-10 rounded-[20px] border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-card/90 md:p-5">
                <div className="flex gap-3">
                  <AuthorAvatar name={userName} size="md" className="mt-1" />
                  <div className="min-w-0 max-w-3xl flex-1">
                    <Textarea
                      className="min-h-[80px] rounded-xl border-border/80 bg-muted/30 text-sm focus-visible:bg-background"
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Join the discussion..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          submitComment()
                        }
                      }}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">Ctrl+Enter to post</span>
                      <Button
                        className="rounded-xl"
                        onClick={submitComment}
                        disabled={submitting || !replyContent.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {submitting ? "Posting..." : "Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-full">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Community</h1>
          <p className="mt-1 text-muted-foreground">
            Connect with fellow students and share study insights
          </p>
        </div>
        {user && (
          <Button className="shrink-0 rounded-xl" onClick={() => setShowForm(!showForm)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Post
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-[20px] border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create a post</h2>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1 rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                className="mt-1 rounded-xl"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your English study tips, questions, or practice insights..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl" onClick={handleSubmit} disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium text-foreground">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to share your insights.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onReact={handleReact}
              onOpenThread={setSelectedId}
              onQuickComment={user ? handleQuickComment : undefined}
              userLoggedIn={!!user}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  )
}

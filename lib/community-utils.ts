import type {
  CommunityCommentItem,
  CommunityFeedPostItem,
  CommunityPostItem,
  CommunityReactResult,
  CommunityReactionType,
} from "@fxprime/types"

export const REACTION_EMOJI: Record<CommunityReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😠",
}

export const REACTION_LABEL: Record<CommunityReactionType, string> = {
  LIKE: "Like",
  LOVE: "Love",
  HAHA: "Haha",
  WOW: "Wow",
  SAD: "Sad",
  ANGRY: "Angry",
}

export function applyReactionToPost(
  post: CommunityPostItem,
  result: CommunityReactResult
): CommunityPostItem {
  if (post.id !== result.id) return post
  return {
    ...post,
    likes: result.likes,
    likedByMe: result.likedByMe,
    myReaction: result.myReaction,
    reactions: result.reactions,
  }
}

export function updatePostReactionInFeed(
  posts: CommunityFeedPostItem[],
  result: CommunityReactResult
): CommunityFeedPostItem[] {
  return posts.map((p) =>
    p.id === result.id ? { ...p, ...applyReactionToPost(p, result) } : p
  )
}

export function updateReactionInComments(
  comments: CommunityCommentItem[],
  result: CommunityReactResult
): CommunityCommentItem[] {
  return comments.map((comment) => ({
    ...applyReactionToPost(comment, result),
    children:
      comment.id === result.id
        ? comment.children
        : updateReactionInComments(comment.children, result),
  }))
}

export function countComments(comments: CommunityCommentItem[]): number {
  return comments.reduce((sum, c) => sum + 1 + countComments(c.children), 0)
}

export function topReactionTypes(
  reactions: CommunityPostItem["reactions"],
  limit = 3
): CommunityReactionType[] {
  return (Object.keys(REACTION_EMOJI) as CommunityReactionType[])
    .filter((type) => reactions[type] > 0)
    .sort((a, b) => reactions[b] - reactions[a])
    .slice(0, limit)
}

export function getAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatCommunityDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

const AVATAR_PALETTE = [
  { bg: "bg-primary/15", text: "text-sidebar-accent-foreground" },
  { bg: "bg-sky-100", text: "text-sky-800" },
  { bg: "bg-violet-100", text: "text-violet-800" },
  { bg: "bg-sidebar-accent", text: "text-sidebar-accent-foreground" },
  { bg: "bg-rose-100", text: "text-rose-800" },
  { bg: "bg-emerald-100", text: "text-emerald-800" },
] as const

export function getAvatarColor(name: string): (typeof AVATAR_PALETTE)[number] {
  let hash = 0
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

export const communityActionClass =
  "h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"

export const communityDangerActionClass =
  "h-8 rounded-lg px-3 text-xs font-medium text-destructive/90 hover:bg-destructive/10 hover:text-destructive"

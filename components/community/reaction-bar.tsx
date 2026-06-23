"use client"

import { useState } from "react"
import type { CommunityPostItem, CommunityReactionType } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import {
  REACTION_EMOJI,
  REACTION_LABEL,
  topReactionTypes,
} from "@/lib/community-utils"
import { cn } from "@/lib/utils"
import { ThumbsUp } from "lucide-react"

const REACTION_TYPES = Object.keys(REACTION_EMOJI) as CommunityReactionType[]

interface ReactionBarProps {
  post: Pick<CommunityPostItem, "id" | "reactions" | "myReaction" | "likes">
  onReact: (postId: string, type: CommunityReactionType) => void
  compact?: boolean
}

export function ReactionBar({ post, onReact, compact }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false)
  const activeTypes = topReactionTypes(post.reactions)

  return (
    <div className="inline-flex items-center gap-2">
      {post.likes > 0 && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground",
            compact && "px-2 py-0.5"
          )}
        >
          <span className="flex items-center -space-x-1">
            {activeTypes.map((type) => (
              <span
                key={type}
                title={REACTION_LABEL[type]}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-card text-[10px] ring-1 ring-background"
              >
                {REACTION_EMOJI[type]}
              </span>
            ))}
          </span>
          <span className="font-medium tabular-nums text-foreground">{post.likes}</span>
        </div>
      )}

      <div
        className="relative"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
      >
        {showPicker && (
          <div className="absolute bottom-full left-0 z-20 mb-1.5 flex items-center gap-0.5 rounded-full border border-border bg-card px-1.5 py-1 shadow-lg">
            {REACTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                title={REACTION_LABEL[type]}
                className={cn(
                  "rounded-full p-1 text-lg transition-transform hover:scale-125",
                  post.myReaction === type && "bg-primary/10 ring-2 ring-primary/30"
                )}
                onClick={() => onReact(post.id, type)}
              >
                {REACTION_EMOJI[type]}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 rounded-lg px-3 text-xs font-medium",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            post.myReaction && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            compact && "h-8 px-2.5"
          )}
          onClick={() => onReact(post.id, post.myReaction ?? "LIKE")}
        >
          {post.myReaction ? (
            <span className="mr-1.5 text-base leading-none">{REACTION_EMOJI[post.myReaction]}</span>
          ) : (
            <ThumbsUp className={cn("mr-1.5 h-3.5 w-3.5", compact && "h-3 w-3")} />
          )}
          {post.myReaction ? REACTION_LABEL[post.myReaction] : "React"}
        </Button>
      </div>
    </div>
  )
}

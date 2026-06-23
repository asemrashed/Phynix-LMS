"use client"

import { Play, CheckCircle2, Clock, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VideoLessonCardProps {
  title: string
  duration: string
  isCompleted?: boolean
  isActive?: boolean
  isLocked?: boolean
  onClick?: () => void
}

export function VideoLessonCard({
  title,
  duration,
  isCompleted = false,
  isActive = false,
  isLocked = false,
  onClick,
}: VideoLessonCardProps) {
  return (
    <motion.button
      whileHover={{ x: isLocked ? 0 : 4 }}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : isCompleted
          ? "bg-muted/50 text-muted-foreground"
          : isLocked
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-muted"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isCompleted
            ? "bg-primary/20 text-primary"
            : isActive
            ? "bg-primary text-primary-foreground"
            : isLocked
            ? "bg-muted text-muted-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "truncate text-sm font-medium",
            isCompleted && "text-muted-foreground"
          )}
        >
          {title}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Status */}
      {isActive && (
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
      )}
    </motion.button>
  )
}

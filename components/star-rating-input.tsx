"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: "sm" | "md"
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  size = "md",
}: StarRatingInputProps) {
  const iconClass = size === "sm" ? "size-4" : "size-5"

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            "rounded-md transition-colors",
            disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105",
          )}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={cn(
              iconClass,
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  )
}

"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAuthorInitials, getAvatarColor } from "@/lib/community-utils"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
} as const

interface AuthorAvatarProps {
  name: string
  size?: keyof typeof sizeClasses
  className?: string
}

export function AuthorAvatar({ name, size = "md", className }: AuthorAvatarProps) {
  const colors = getAvatarColor(name)

  return (
    <Avatar className={cn(sizeClasses[size], "shrink-0", className)}>
      <AvatarFallback className={cn(colors.bg, colors.text, "font-semibold")}>
        {getAuthorInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AdminStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  href?: string
  className?: string
}

export function AdminStatCard({ label, value, icon: Icon, color, href, className }: AdminStatCardProps) {
  const content = (
    <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:mb-3 sm:h-10 sm:w-10",
          color
        )}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0 flex-1 sm:flex-none">
        <p className="truncate text-lg font-bold leading-tight text-foreground sm:text-2xl">{value}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground sm:mt-0 sm:text-sm">
          {label}
        </p>
      </div>
    </div>
  )

  const cardClassName = cn(
    "rounded-2xl bg-card p-3.5 shadow-sm sm:rounded-[20px] sm:p-6 min-h-18 sm:min-h-0",
    className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(cardClassName, "transition-shadow hover:shadow-md active:scale-[0.98]")}
      >
        {content}
      </Link>
    )
  }

  return <div className={cardClassName}>{content}</div>
}

export function AdminStatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-18 items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm sm:min-h-0 sm:flex-col sm:items-start sm:rounded-[20px] sm:p-6",
        className
      )}
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-xl sm:mb-3 sm:h-10 sm:w-10" />
      <div className="min-w-0 flex-1 space-y-2 sm:flex-none">
        <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
        <Skeleton className="h-3 w-20 sm:h-4 sm:w-28" />
      </div>
    </div>
  )
}

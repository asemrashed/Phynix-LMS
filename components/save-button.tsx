"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { SaveStatus } from "@fxprime/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type SaveMode = "bookmark" | "wishlist"

interface SaveButtonProps {
  entityType: string
  entityId: string
  mode: SaveMode
  className?: string
  size?: "sm" | "icon"
  showLabel?: boolean
}

export function SaveButton({
  entityType,
  entityId,
  mode,
  className,
  size = "icon",
  showLabel = false,
}: SaveButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [itemId, setItemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    async function checkStatus() {
      try {
        const status = await api<SaveStatus>(
          `/bookmarks/status?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`
        )
        if (mode === "bookmark") {
          setSaved(status.isBookmarked)
          setItemId(status.bookmarkId)
        } else {
          setSaved(status.isWishlisted)
          setItemId(status.wishlistId)
        }
      } catch {
        // ignore
      }
    }
    checkStatus()
  }, [user, entityType, entityId, mode])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      if (saved && itemId) {
        const path =
          mode === "bookmark"
            ? `/bookmarks/${itemId}`
            : `/bookmarks/wishlist/${itemId}`
        await api(path, { method: "DELETE" })
        setSaved(false)
        setItemId(null)
        toast.success(mode === "bookmark" ? "Bookmark removed" : "Removed from wishlist")
      } else {
        const path = mode === "bookmark" ? "/bookmarks" : "/bookmarks/wishlist"
        const result = await api<{ id: string }>(path, {
          method: "POST",
          body: JSON.stringify({ entityType, entityId }),
        })
        setSaved(true)
        setItemId(result.id)
        toast.success(mode === "bookmark" ? "Bookmarked" : "Added to wishlist")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const Icon = mode === "bookmark" ? Bookmark : Heart
  const label = mode === "bookmark" ? "Bookmark" : "Wishlist"

  return (
    <Button
      type="button"
      variant="secondary"
      size={size === "icon" ? "icon" : "sm"}
      className={cn(
        "shrink-0 rounded-full shadow-sm",
        saved && mode === "bookmark" && "text-primary",
        saved && mode === "wishlist" && "text-destructive",
        className
      )}
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? `Remove ${label}` : `Add to ${label}`}
      title={saved ? `Remove ${label}` : `Add to ${label}`}
    >
      <Icon className={cn("h-4 w-4", saved && "fill-current")} />
      {showLabel && <span className="ml-2">{saved ? `Saved` : label}</span>}
    </Button>
  )
}

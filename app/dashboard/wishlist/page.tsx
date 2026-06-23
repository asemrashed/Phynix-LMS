"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import type { WishlistItem } from "@fxprime/types"
import { Heart, Trash2 } from "lucide-react"
import { getMediaUrl } from "@/lib/media-url"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { formatPrice } from "@/lib/money"

function formatWishlistPrice(price?: number): string {
  if (price === undefined) return ""
  return formatPrice(price)
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const data = await api<WishlistItem[]>("/bookmarks/wishlist")
        setItems(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [])

  async function handleRemove(id: string) {
    try {
      await api(`/bookmarks/wishlist/${id}`, { method: "DELETE" })
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Wishlist</h1>
        <p className="text-muted-foreground">Products you want to buy later</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>Your wishlist is empty</EmptyTitle>
            <EmptyDescription>
              Save digital and physical products from the marketplace to find them here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const thumb = getMediaUrl(item.thumbnailUrl)
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-[20px] bg-card p-4 shadow-sm"
              >
                <Link
                  href={item.href}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.entityType.replace(/_/g, " ")}
                    </Badge>
                    {item.price !== undefined && (
                      <span className="text-sm font-semibold text-primary">
                        {formatWishlistPrice(item.price)}
                      </span>
                    )}
                  </div>
                  <Link href={item.href} className="block">
                    <p className="line-clamp-2 font-medium text-foreground hover:text-primary">
                      {item.title}
                    </p>
                  </Link>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

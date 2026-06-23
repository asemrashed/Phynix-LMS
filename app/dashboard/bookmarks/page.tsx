"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import type { BookmarkItem } from "@fxprime/types"
import { Bookmark, Trash2 } from "lucide-react"
import { getMediaUrl } from "@/lib/media-url"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const data = await api<BookmarkItem[]>("/bookmarks")
        setBookmarks(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  async function handleRemove(id: string) {
    try {
      await api(`/bookmarks/${id}`, { method: "DELETE" })
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Bookmarks</h1>
        <p className="text-muted-foreground">Saved courses, lessons, and blog posts</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bookmark />
            </EmptyMedia>
            <EmptyTitle>No bookmarks yet</EmptyTitle>
            <EmptyDescription>
              Bookmark courses, lessons, or blog posts to find them quickly here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => {
            const thumb = getMediaUrl(bookmark.thumbnailUrl)
            return (
              <div
                key={bookmark.id}
                className="flex gap-4 rounded-[20px] bg-card p-4 shadow-sm"
              >
                <Link
                  href={bookmark.href}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={bookmark.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Bookmark className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {bookmark.entityType.replace(/_/g, " ")}
                    </Badge>
                    {bookmark.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {bookmark.subtitle}
                      </span>
                    )}
                  </div>
                  <Link href={bookmark.href} className="block">
                    <p className="line-clamp-2 font-medium text-foreground hover:text-primary">
                      {bookmark.title}
                    </p>
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => handleRemove(bookmark.id)}
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

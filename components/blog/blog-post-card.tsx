"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { BlogPostListItem } from "@fxprime/types"
import { SaveButton } from "@/components/save-button"
import { getBlogCoverUrl } from "@/lib/media-url"

interface BlogPostCardProps {
  post: BlogPostListItem
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <div className="group relative flex flex-col h-[420px] rounded-[20px] bg-card shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <div className="absolute right-3 top-3 z-10">
        <SaveButton entityType="BLOG" entityId={post.id} mode="bookmark" />
      </div>
      <Link href={`/blog/${post.slug}`} className="block shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getBlogCoverUrl(post.coverUrl)}
          alt={post.title}
          className="h-44 w-full rounded-t-[20px] object-cover"
        />
      </Link>
      <div className="flex flex-col flex-1 p-6 min-h-0">
        <div className="mb-2 flex items-center gap-2 shrink-0">
          <Link href={`/blog/category/${post.categorySlug}`}>
            <Badge variant="outline" className="hover:bg-muted">{post.category}</Badge>
          </Link>
          {post.isPremium && <Badge>Premium</Badge>}
        </div>
        <Link href={`/blog/${post.slug}`} className="flex flex-col flex-1 justify-between min-h-0">
          <div className="min-h-0">
            <h2 className="text-lg font-bold text-foreground group-hover:text-primary line-clamp-2 leading-snug">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </div>
          {post.publishedAt && (
            <p className="mt-3 text-xs text-muted-foreground shrink-0">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          )}
        </Link>
      </div>
    </div>
  )
}

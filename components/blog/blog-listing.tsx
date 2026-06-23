"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { BlogPostListItem, BlogCategoryItem } from "@fxprime/types"
import { api } from "@/lib/api"
import { BlogPostCard } from "./blog-post-card"
import { cn } from "@/lib/utils"

interface BlogListingProps {
  categorySlug?: string
}

export function BlogListing({ categorySlug }: BlogListingProps) {
  const [posts, setPosts] = useState<BlogPostListItem[]>([])
  const [categories, setCategories] = useState<BlogCategoryItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | undefined>(categorySlug)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveCategory(categorySlug)
  }, [categorySlug])

  useEffect(() => {
    api<BlogCategoryItem[]>("/blog/categories")
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      try {
        const query = activeCategory ? `?limit=20&category=${activeCategory}` : "?limit=20"
        const data = await api<{ posts: BlogPostListItem[] }>(`/blog${query}`)
        setPosts(data.posts)
      } catch {
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [activeCategory])

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Link
            href="/blog"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              !activeCategory
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog/category/${cat.slug}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.name}
              {cat.postCount > 0 && (
                <span className="ml-1 opacity-70">({cat.postCount})</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-center text-muted-foreground">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

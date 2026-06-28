"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { BlogPostDetail } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PremiumPaywall } from "@/components/premium-paywall"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { SaveButton } from "@/components/save-button"
import { BlogCoverImage } from "@/components/blog/blog-cover-image"

function isHtmlContent(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content.trim())
}

function renderContent(content: string) {
  if (isHtmlContent(content)) {
    return (
      <div
        className="[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-4 [&_p]:text-muted-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:text-muted-foreground font-sans"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-6 text-xl font-bold">
          {line.slice(3)}
        </h2>
      )
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-4 text-lg font-semibold">
          {line.slice(4)}
        </h3>
      )
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 text-muted-foreground">
          {line.slice(2)}
        </li>
      )
    }
    if (line.trim() === "") return <br key={i} />
    return (
      <p key={i} className="text-muted-foreground">
        {line}
      </p>
    )
  })
}

interface BlogPostViewProps {
  slug: string
}

export function BlogPostView({ slug }: BlogPostViewProps) {
  const { user, isLoading: authLoading } = useAuth()
  const [post, setPost] = useState<BlogPostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await api<BlogPostDetail>(`/blog/${slug}`)
        if (!cancelled) setPost(data)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!authLoading) {
      load()
    }

    return () => {
      cancelled = true
    }
  }, [slug, user, authLoading])

  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full rounded-[20px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="mt-4 inline-block">
          <Button variant="outline" className="rounded-xl">
            Back to Blog
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/blog">
        <Button variant="ghost" className="mb-6 rounded-xl">
          <ArrowLeft className="mr-2 size-4" />
          Back to Blog
        </Button>
      </Link>

      <BlogCoverImage
        coverUrl={post.coverUrl}
        alt={post.title}
        className="mb-8 h-64 w-full rounded-[20px] object-cover md:h-80"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={`/blog/category/${post.categorySlug}`}>
          <Badge variant="outline" className="hover:bg-muted">{post.category}</Badge>
        </Link>
        {post.isPremium && <Badge>Premium</Badge>}
        <SaveButton entityType="BLOG" entityId={post.id} mode="bookmark" size="sm" showLabel />
      </div>

      <h1 className="text-3xl font-bold text-foreground md:text-4xl">
        {post.title}
      </h1>

      {post.publishedAt && (
        <p className="mt-4 text-sm text-muted-foreground">
          Published {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      )}

      {post.excerpt && (
        <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
      )}

      {post.isGated ? (
        <div className="mt-8 space-y-6">
          <PremiumPaywall
            isLoggedIn={!!user}
            loginRedirect={`/blog/${slug}`}
            description={
              user
                ? "Your current plan does not include premium articles. Upgrade to PRO or Lifetime to read the full content."
                : "Sign in and subscribe to PRO or Lifetime to unlock this premium article."
            }
          />
        </div>
      ) : post.content ? (
        <article className="prose prose-neutral mt-8 max-w-none font-sans dark:prose-invert">
          {renderContent(post.content)}
        </article>
      ) : null}

      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <aside className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 text-xl font-bold">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {post.relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group rounded-[20px] bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-xs text-muted-foreground">{related.category}</p>
                <h3 className="mt-1 font-semibold group-hover:text-primary">
                  {related.title}
                </h3>
                {related.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {related.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </aside>
      )}
    </>
  )
}

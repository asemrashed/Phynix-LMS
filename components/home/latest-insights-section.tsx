"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { BlogPostListItem, PublicHomepageSection } from "@fxprime/types"
import { api } from "@/lib/api"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import { SectionHeader } from "@/components/home/section-header"
import { LandingContainer } from "@/components/home/landing-container"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

export function LatestInsightsSection({
  posts: externalPosts,
  isLoading: externalLoading,
  section,
}: {
  posts?: BlogPostListItem[]
  isLoading?: boolean
  section?: PublicHomepageSection | null
} = {}) {
  const content = mergeHomepageSection("latest_insights", section)
  const emptyMessage =
    (content.metadata?.emptyMessage as string | undefined) ??
    "New IELTS tips coming soon. Check back for speaking topics, writing strategies, and study guides."
  const cta = content.ctaPrimary ?? { label: "View All Insights", href: "/blog" }
  const usesExternal = externalPosts !== undefined
  const [posts, setPosts] = useState<BlogPostListItem[]>(externalPosts ?? [])
  const [loading, setLoading] = useState(!usesExternal)

  useEffect(() => {
    if (usesExternal) {
      setPosts(externalPosts)
      return
    }
    api<{ posts: BlogPostListItem[]; total: number }>("/blog?limit=6")
      .then((data) => setPosts(data.posts))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [usesExternal, externalPosts])

  const showLoading = usesExternal ? (externalLoading ?? false) : loading

  return (
    <section className="py-20">
      <LandingContainer>
        <SectionHeader
          eyebrow={content.eyebrow ?? undefined}
          title={content.title ?? "Latest Insights & Blog"}
          description={content.description ?? undefined}
        />

        {showLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-[20px] bg-muted" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 6).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="rounded-xl" asChild>
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </LandingContainer>
    </section>
  )
}

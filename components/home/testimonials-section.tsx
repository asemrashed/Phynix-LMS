"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import type { TestimonialItem, PublicHomepageSection } from "@fxprime/types"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/media-url"
import { SectionHeader } from "@/components/home/section-header"
import { LandingContainer } from "@/components/home/landing-container"
import type { HomepageTestimonials } from "@/lib/hooks/use-homepage-data"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

function youtubeIdFromUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] ?? null
}

function youtubeThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function VideoReviewCard({ item, index }: { item: TestimonialItem; index: number }) {
  const videoId = item.mediaUrl ? youtubeIdFromUrl(item.mediaUrl) : null
  const href = item.mediaUrl || "#"
  const thumb =
    videoId && youtubeThumb(videoId)
      ? youtubeThumb(videoId)
      : "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&h=360&fit=crop"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-[20px] bg-card shadow-sm"
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="relative aspect-video">
          <Image
            src={thumb}
            alt={item.title || item.authorName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              ▶
            </div>
          </div>
        </div>
        <p className="p-4 font-medium text-foreground">{item.title || item.authorName}</p>
      </a>
    </motion.div>
  )
}

function ScreenshotReviewCard({ item, index }: { item: TestimonialItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-[20px] border bg-card shadow-sm"
    >
      {item.mediaUrl && (
        <div className="relative aspect-4/3">
          <Image
            src={getMediaUrl(item.mediaUrl)}
            alt={item.title || item.authorName}
            fill
            className="object-cover"
          />
        </div>
      )}
      <p className="p-3 text-sm font-medium">{item.title || item.authorName}</p>
    </motion.div>
  )
}

function TrustpilotReviewCard({ item, index }: { item: TestimonialItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      viewport={{ once: true }}
      className="rounded-[20px] bg-card p-6 shadow-sm"
    >
      {item.rating && (
        <div className="mb-2 flex gap-0.5">
          {Array.from({ length: item.rating }).map((_, i) => (
            <span key={i} className="text-green-500">
              ★
            </span>
          ))}
        </div>
      )}
      {item.content && (
        <p className="mb-3 text-sm text-muted-foreground">&ldquo;{item.content}&rdquo;</p>
      )}
      <p className="text-sm font-semibold text-foreground">{item.authorName}</p>
      <p className="text-xs text-muted-foreground">Trustpilot</p>
    </motion.div>
  )
}

export function TestimonialsSection({
  testimonials: externalTestimonials,
  isLoading: externalLoading,
  section,
}: {
  testimonials?: HomepageTestimonials
  isLoading?: boolean
  section?: PublicHomepageSection | null
} = {}) {
  const content = mergeHomepageSection("testimonials", section)
  const emptyMessage =
    (content.metadata?.emptyMessage as string | undefined) ?? "Student reviews coming soon."
  const usesExternal = externalTestimonials !== undefined
  const [video, setVideo] = useState<TestimonialItem[]>(externalTestimonials?.video ?? [])
  const [screenshots, setScreenshots] = useState<TestimonialItem[]>(
    externalTestimonials?.screenshots ?? []
  )
  const [trustpilot, setTrustpilot] = useState<TestimonialItem[]>(
    externalTestimonials?.trustpilot ?? []
  )
  const [loading, setLoading] = useState(!usesExternal)

  useEffect(() => {
    if (usesExternal && externalTestimonials) {
      setVideo(externalTestimonials.video)
      setScreenshots(externalTestimonials.screenshots)
      setTrustpilot(externalTestimonials.trustpilot)
      return
    }
    async function load() {
      try {
        const [v, s, t] = await Promise.all([
          api<TestimonialItem[]>("/testimonials?type=VIDEO"),
          api<TestimonialItem[]>("/testimonials?type=SCREENSHOT"),
          api<TestimonialItem[]>("/testimonials?type=TRUSTPILOT"),
        ])
        setVideo(v)
        setScreenshots(s)
        setTrustpilot(t)
      } catch (err) {
        console.error("Failed to load testimonials:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [usesExternal, externalTestimonials])

  const showLoading = usesExternal ? (externalLoading ?? false) : loading
  const hasContent = video.length > 0 || screenshots.length > 0 || trustpilot.length > 0

  return (
    <section className="py-20" aria-label="Student Success and Reviews">
      <LandingContainer>
        <SectionHeader
          eyebrow={content.eyebrow ?? undefined}
          title={content.title ?? "Student Success & Reviews"}
          description={content.description ?? undefined}
        />

        {showLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-[20px] bg-muted" />
            ))}
          </div>
        ) : !hasContent ? (
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-12">
            {video.length > 0 && (
              <div>
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Video Reviews
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {video.map((item, index) => (
                    <VideoReviewCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            )}

            {screenshots.length > 0 && (
              <div>
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Screenshot Reviews
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {screenshots.map((item, index) => (
                    <ScreenshotReviewCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            )}

            {trustpilot.length > 0 && (
              <div>
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Trustpilot Reviews
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trustpilot.map((item, index) => (
                    <TrustpilotReviewCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </LandingContainer>
    </section>
  )
}

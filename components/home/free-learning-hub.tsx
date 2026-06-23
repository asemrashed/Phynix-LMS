"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { SectionHeader } from "@/components/home/section-header"
import { LandingContainer } from "@/components/home/landing-container"
import type { PublicHomepageSection } from "@fxprime/types"
import { getHomepageIcon } from "@/lib/homepage-icons"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

const HUB_COLORS = [
  "bg-green-500/10 text-green-600",
  "bg-red-500/10 text-red-600",
  "bg-blue-500/10 text-blue-600",
  "bg-primary/10 text-sidebar-accent-foreground",
]

interface FreeLearningHubProps {
  section?: PublicHomepageSection | null
}

export function FreeLearningHub({ section }: FreeLearningHubProps) {
  const content = mergeHomepageSection("free_learning_hub", section)

  return (
    <section className="bg-muted/30 py-20">
      <LandingContainer>
        <SectionHeader
          eyebrow={content.eyebrow ?? undefined}
          title={content.title ?? "Free Learning Hub"}
          description={content.description ?? undefined}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((hub, index) => {
            const Icon = getHomepageIcon(hub.icon)
            const color = HUB_COLORS[index % HUB_COLORS.length]
            const inner = (
              <>
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{hub.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{hub.description}</p>
                <span className="inline-flex items-center text-sm font-medium text-primary">
                  Explore
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </>
            )

            return (
              <motion.div
                key={`${hub.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {hub.external ? (
                  <a
                    href={hub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-full rounded-[20px] bg-card p-6 shadow-sm transition-all hover:shadow-lg"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    href={hub.href ?? "#"}
                    className="group block h-full rounded-[20px] bg-card p-6 shadow-sm transition-all hover:shadow-lg"
                  >
                    {inner}
                  </Link>
                )}
              </motion.div>
            )
          })}
        </div>
      </LandingContainer>
    </section>
  )
}

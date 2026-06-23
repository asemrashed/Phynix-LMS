"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LandingContainer } from "@/components/home/landing-container"
import type { PlatformStats, PublicHomepageSection } from "@fxprime/types"
import { api } from "@/lib/api"
import { getHomepageIcon } from "@/lib/homepage-icons"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

export function TrustBar({
  stats: externalStats,
  section,
}: {
  stats?: PlatformStats | null
  section?: PublicHomepageSection | null
} = {}) {
  const [stats, setStats] = useState<PlatformStats | null>(externalStats ?? null)
  const content = mergeHomepageSection("trust_bar", section)

  useEffect(() => {
    if (externalStats !== undefined) {
      setStats(externalStats)
      return
    }
    api<PlatformStats>("/stats").then(setStats).catch(() => {})
  }, [externalStats])

  function labelForItem(title: string, statKey?: string) {
    if (statKey === "students" && stats) {
      const count = stats.students
      return count >= 1000 ? `${count.toLocaleString()}+ Students` : "1000+ Students"
    }
    return title
  }

  return (
    <section className="border-y border-border bg-muted/30 py-6">
      <LandingContainer>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {content.items.map((item, index) => {
            const Icon = getHomepageIcon(item.icon)
            return (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 rounded-xl px-2 py-2 md:justify-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground md:text-base">
                  {labelForItem(item.title, item.statKey)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </LandingContainer>
    </section>
  )
}

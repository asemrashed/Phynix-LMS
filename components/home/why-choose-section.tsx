"use client"

import { motion } from "framer-motion"
import { SectionHeader } from "@/components/home/section-header"
import { LandingContainer } from "@/components/home/landing-container"
import type { PublicHomepageSection } from "@fxprime/types"
import { getHomepageIcon } from "@/lib/homepage-icons"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

interface WhyChooseSectionProps {
  section?: PublicHomepageSection | null
}

export function WhyChooseSection({ section }: WhyChooseSectionProps) {
  const content = mergeHomepageSection("why_choose", section)

  return (
    <section className="py-20">
      <LandingContainer>
        <SectionHeader
          eyebrow={content.eyebrow ?? undefined}
          title={content.title ?? "Why Choose Us"}
          description={content.description ?? undefined}
        />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {content.items.map((feature, index) => {
            const Icon = getHomepageIcon(feature.icon)
            return (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="rounded-[20px] bg-card p-6 shadow-sm transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </LandingContainer>
    </section>
  )
}

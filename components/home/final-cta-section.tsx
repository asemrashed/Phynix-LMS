"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingContainer } from "@/components/home/landing-container"
import { motion } from "framer-motion"
import type { PublicHomepageSection } from "@fxprime/types"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

interface FinalCTASectionProps {
  section?: PublicHomepageSection | null
}

export function FinalCTASection({ section }: FinalCTASectionProps) {
  const content = mergeHomepageSection("final_cta", section)

  return (
    <section className="py-20">
      <LandingContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[32px] bg-secondary p-8 text-secondary-foreground md:p-16"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>

            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{content.title}</h2>
            <p className="mb-8 max-w-2xl text-secondary-foreground/80">{content.description}</p>

            <div className="flex flex-col gap-4 sm:flex-row">
              {content.ctaPrimary && (
                <Button
                  size="lg"
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link href={content.ctaPrimary.href}>
                    {content.ctaPrimary.label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              {content.ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline-inverse"
                  className="rounded-xl px-8 text-lg"
                  asChild
                >
                  <Link href={content.ctaSecondary.href}>{content.ctaSecondary.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </LandingContainer>
    </section>
  )
}

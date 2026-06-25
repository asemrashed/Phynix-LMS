"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { LandingContainer } from "@/components/home/landing-container"
import type { PlatformStats, PublicHomepageSection } from "@fxprime/types"
import { api } from "@/lib/api"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

interface HeroSectionProps {
  stats?: PlatformStats | null
  statsLoading?: boolean
  section?: PublicHomepageSection | null
}

export function HeroSection({ stats: externalStats, statsLoading, section }: HeroSectionProps = {}) {
  const [stats, setStats] = useState<PlatformStats | null>(externalStats ?? null)
  const content = mergeHomepageSection("hero", section)

  useEffect(() => {
    if (externalStats !== undefined) {
      setStats(externalStats)
      return
    }
    api<PlatformStats>("/stats").then(setStats).catch(() => { })
  }, [externalStats])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <LandingContainer className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
              {content.eyebrow}
            </p>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {content.title === "Master English with Expert-Led Preparation" ? (
                <>
                  Master{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    English
                  </span>{" "}
                  with{" "}
                  <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    Expert-Led Preparation
                  </span>
                </>
              ) : (
                content.title
              )}
            </h1>

            <p className="mb-6 text-pretty text-lg text-muted-foreground md:text-xl">
              {content.description}
            </p>



            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              {content.ctaPrimary && (
                <Button size="lg" className="rounded-xl bg-primary px-8 text-lg hover:bg-primary/90" asChild>
                  <Link href={content.ctaPrimary.href}>
                    {content.ctaPrimary.label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              {content.ctaSecondary && (
                <Button size="lg" variant="outline" className="rounded-xl px-8 text-lg" asChild>
                  <Link href={content.ctaSecondary.href}>{content.ctaSecondary.label}</Link>
                </Button>
              )}
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md lg:max-w-lg">
              <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/20 to-accent/20 p-1">
                <div className="h-full w-full overflow-hidden rounded-[28px] bg-card">
                  <Image
                    src={process.env.NEXT_PUBLIC_HERO_IMAGE_URL || "/Heor-Image.jpeg"}
                    alt="English preparation and education"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-8 top-1/4 rounded-[20px] bg-card p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Live Sessions</div>
                    <div className="text-xs text-muted-foreground">Real Market Analysis</div>
                  </div>
                </div>
              </motion.div> */}

              {/* <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 bottom-1/4 rounded-[20px] bg-card p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <span className="text-lg font-bold text-accent">FX</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Certified</div>
                    <div className="text-xs text-muted-foreground">QR Verifiable</div>
                  </div>
                </div>
              </motion.div> */}

            </div>
          </motion.div>
        </div>
      </LandingContainer>
    </section>
  )
}

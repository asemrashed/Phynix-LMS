"use client"

import dynamic from "next/dynamic"
import { HeroSection } from "@/components/home/hero-section"
import { WhyChooseSection } from "@/components/home/why-choose-section"
import { FeaturedCourses } from "@/components/home/featured-courses"
import { SectionSkeleton } from "@/components/home/section-skeleton"
import { useHomepageData } from "@/lib/hooks/use-homepage-data"
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/site-content-defaults"

const TestimonialsSection = dynamic(
  () => import("@/components/home/testimonials-section").then((m) => m.TestimonialsSection),
  { loading: () => <SectionSkeleton /> }
)

const LatestInsightsSection = dynamic(
  () => import("@/components/home/latest-insights-section").then((m) => m.LatestInsightsSection),
  { loading: () => <SectionSkeleton /> }
)

const FinalCTASection = dynamic(
  () => import("@/components/home/final-cta-section").then((m) => m.FinalCTASection),
  { loading: () => <SectionSkeleton className="py-12" /> }
)

export function HomePageContent() {
  const { stats, featuredCourses, blogPosts, testimonials, courseReviews, loading } = useHomepageData()
  const sections = DEFAULT_HOMEPAGE_SECTIONS

  return (
    <>
      <HeroSection stats={stats} statsLoading={loading} section={sections.hero} />

      <FeaturedCourses
        courses={featuredCourses}
        isLoading={loading}
        section={sections.featured_courses}
      />
      <WhyChooseSection section={sections.why_choose} />
      <TestimonialsSection
        testimonials={testimonials}
        courseReviews={courseReviews}
        isLoading={loading}
        section={sections.testimonials}
      />
      <LatestInsightsSection
        posts={blogPosts}
        isLoading={loading}
        section={sections.latest_insights}
      />
      <FinalCTASection section={sections.final_cta} />
    </>
  )
}

import type { Metadata } from "next"
import { HomePageContent } from "@/components/home/home-page-content"

export const metadata: Metadata = {
  title: "Master English with Expert-Led Preparation — PhynixEducation",
  description:
    "Build Listening, Reading, Writing, and Speaking skills through structured courses, live classes, and mock tests designed for serious test-takers.",
  openGraph: {
    title: "PhynixEducation",
    description:
      "Build Listening, Reading, Writing, and Speaking skills through structured courses and live classes.",
  },
}

export default function HomePage() {
  return <HomePageContent />
}

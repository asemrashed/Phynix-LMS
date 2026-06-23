import type { Metadata } from "next"
import { HomePageContent } from "@/components/home/home-page-content"

export const metadata: Metadata = {
  title: "Master IELTS with Expert-Led Preparation — IELTS LMS",
  description:
    "Build Listening, Reading, Writing, and Speaking skills through structured courses, live classes, and mock tests designed for serious test-takers.",
  openGraph: {
    title: "IELTS LMS",
    description:
      "Build Listening, Reading, Writing, and Speaking skills through structured courses and live classes.",
  },
}

export default function HomePage() {
  return <HomePageContent />
}

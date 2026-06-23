import type { Metadata } from "next"
import { fetchServerApi } from "@/lib/api-url"
import { buildOgImage, defaultOg, getSiteUrl } from "@/lib/seo"
import { stripHtml } from "@/lib/strip-html"

type CourseMeta = {
  title: string
  description: string
  thumbnailUrl: string | null
}

async function fetchCourse(slug: string): Promise<CourseMeta | null> {
  return fetchServerApi<CourseMeta>(`/courses/${slug}`)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await fetchCourse(slug)
  const site = getSiteUrl()

  if (!course) {
    return { title: "Course | IELTS LMS" }
  }

  const title = `${course.title} | IELTS LMS`
  const description = stripHtml(course.description).slice(0, 160)
  const image = buildOgImage(course.thumbnailUrl)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${site}/courses/${slug}`,
      siteName: defaultOg.siteName,
      type: "website",
      images: image ? [{ url: image, alt: course.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children
}

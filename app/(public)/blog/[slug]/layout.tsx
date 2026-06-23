import type { Metadata } from "next"
import { fetchServerApi } from "@/lib/api-url"
import { buildOgImage, defaultOg, getSiteUrl } from "@/lib/seo"

type BlogMeta = {
  title: string
  excerpt: string | null
  coverUrl: string | null
  metaTitle: string | null
  metaDesc: string | null
}

async function fetchPost(slug: string): Promise<BlogMeta | null> {
  return fetchServerApi<BlogMeta>(`/blog/${slug}`)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  const site = getSiteUrl()

  if (!post) {
    return { title: "Blog | IELTS LMS" }
  }

  const title = post.metaTitle || `${post.title} | IELTS LMS`
  const description =
    post.metaDesc || post.excerpt || defaultOg.description
  const image = buildOgImage(post.coverUrl)

  return {
    title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: `${site}/blog/${slug}`,
      siteName: defaultOg.siteName,
      type: "article",
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children
}

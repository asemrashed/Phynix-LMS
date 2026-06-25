import type { Metadata } from "next"
import type { PublicSitePage } from "@fxprime/types"
import { SitePageView } from "@/components/site/site-page-view"
import { fetchServerApi } from "@/lib/api-url"
import { mergeSitePage } from "@/lib/site-content-defaults"

export async function generateMetadata(): Promise<Metadata> {
  const page = mergeSitePage("about", await fetchServerApi<PublicSitePage>("/site/pages/about"))
  return {
    title: page?.seoTitle ?? "About Us — PhynixEducation",
    description:
      page?.seoDescription ??
      "Learn about PhynixEducation — professional English preparation platform.",
  }
}

export default async function AboutPage() {
  const page = mergeSitePage("about", await fetchServerApi<PublicSitePage>("/site/pages/about"))
  if (!page) return null
  return <SitePageView page={page} />
}

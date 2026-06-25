import type { Metadata } from "next"
import type { PublicSitePage } from "@fxprime/types"
import { SitePageView } from "@/components/site/site-page-view"
import { fetchServerApi } from "@/lib/api-url"
import { mergeSitePage } from "@/lib/site-content-defaults"

export async function generateMetadata(): Promise<Metadata> {
  const page = mergeSitePage("terms", await fetchServerApi<PublicSitePage>("/site/pages/terms"))
  return { title: page?.seoTitle ?? "Terms & Conditions — PhynixEducation" }
}

export default async function TermsPage() {
  const page = mergeSitePage("terms", await fetchServerApi<PublicSitePage>("/site/pages/terms"))
  if (!page) return null
  return <SitePageView page={page} />
}

import type { Metadata } from "next"
import type { PublicSitePage } from "@fxprime/types"
import { SitePageView } from "@/components/site/site-page-view"
import { fetchServerApi } from "@/lib/api-url"
import { mergeSitePage } from "@/lib/site-content-defaults"

export async function generateMetadata(): Promise<Metadata> {
  const page = mergeSitePage(
    "privacy-policy",
    await fetchServerApi<PublicSitePage>("/site/pages/privacy-policy")
  )
  return { title: page?.seoTitle ?? "Privacy Policy — IELTS LMS" }
}

export default async function PrivacyPolicyPage() {
  const page = mergeSitePage(
    "privacy-policy",
    await fetchServerApi<PublicSitePage>("/site/pages/privacy-policy")
  )
  if (!page) return null
  return <SitePageView page={page} />
}

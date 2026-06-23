import type { Metadata } from "next"
import type { PublicSitePage } from "@fxprime/types"
import { SitePageView } from "@/components/site/site-page-view"
import { fetchServerApi } from "@/lib/api-url"
import { mergeSitePage } from "@/lib/site-content-defaults"

export async function generateMetadata(): Promise<Metadata> {
  const page = mergeSitePage(
    "refund-policy",
    await fetchServerApi<PublicSitePage>("/site/pages/refund-policy")
  )
  return { title: page?.seoTitle ?? "Refund Policy — IELTS LMS" }
}

export default async function RefundPolicyPage() {
  const page = mergeSitePage(
    "refund-policy",
    await fetchServerApi<PublicSitePage>("/site/pages/refund-policy")
  )
  if (!page) return null
  return <SitePageView page={page} />
}

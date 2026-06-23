import type { PublicSitePage } from "@fxprime/types"
import { LegalPageLayout } from "@/components/legal-page-layout"

interface SitePageViewProps {
  page: PublicSitePage
}

export function SitePageView({ page }: SitePageViewProps) {
  return (
    <LegalPageLayout title={page.title} description={page.description ?? undefined}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </LegalPageLayout>
  )
}

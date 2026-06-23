"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminSitePageDetail } from "@fxprime/types"
import { SitePageEditor } from "@/components/admin/site-page-editor"
import { Spinner } from "@/components/ui/spinner"

export default function AdminSitePageEditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [page, setPage] = useState<AdminSitePageDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<AdminSitePageDetail>(`/admin/site/pages/${slug}`)
      .then(setPage)
      .catch(() => router.push("/admin/site/pages"))
      .finally(() => setLoading(false))
  }, [slug, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!page) return null

  return <SitePageEditor initialPage={page} />
}

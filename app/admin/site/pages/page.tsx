"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { AdminSitePageListItem } from "@fxprime/types"
import { AdminDataTable, AdminPageHeader, type AdminColumn } from "@/components/admin/admin-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function AdminSitePagesListPage() {
  const [pages, setPages] = useState<AdminSitePageListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<AdminSitePageListItem[]>("/admin/site/pages")
      .then(setPages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const columns: AdminColumn<AdminSitePageListItem>[] = [
    { key: "title", header: "Title", cell: (row) => row.title },
    { key: "slug", header: "Slug", cell: (row) => `/${row.slug}` },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isPublished ? "default" : "secondary"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      cell: (row) => format(new Date(row.updatedAt), "MMM d, yyyy"),
    },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Static pages"
        description="Legal and informational pages shown on the public site."
      />

      <AdminDataTable
        columns={columns}
        data={pages}
        rowKey={(row) => row.slug}
        loading={loading}
        actions={(row) => (
          <Button size="sm" variant="outline" className="rounded-xl" asChild>
            <Link href={`/admin/site/pages/${row.slug}`}>Edit</Link>
          </Button>
        )}
      />
    </div>
  )
}

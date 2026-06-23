"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import type { AdminSitePageDetail } from "@fxprime/types"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { AdminPageHeader } from "@/components/admin/admin-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

const fieldClassName = "rounded-xl bg-white"

interface SitePageEditorProps {
  initialPage: AdminSitePageDetail
}

export function SitePageEditor({ initialPage }: SitePageEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(initialPage.title)
  const [description, setDescription] = useState(initialPage.description ?? "")
  const [contentHtml, setContentHtml] = useState(initialPage.contentHtml)
  const [seoTitle, setSeoTitle] = useState(initialPage.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(initialPage.seoDescription ?? "")
  const [isPublished, setIsPublished] = useState(initialPage.isPublished)

  const save = async () => {
    if (!title.trim() || contentHtml.length < 10) {
      toast.error("Title and content are required")
      return
    }
    setSaving(true)
    try {
      await api(`/admin/site/pages/${initialPage.slug}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description: description || null,
          contentHtml,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          isPublished,
        }),
      })
      toast.success("Page saved")
      router.refresh()
    } catch {
      toast.error("Failed to save page")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/admin/site/pages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <AdminPageHeader
          title={title}
          description={`Edit /${initialPage.slug}`}
          actions={
            <Button className="rounded-xl" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save page"}
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <Label>Page title</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Subtitle / description</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Content</Label>
            <div className="mt-1">
              <RichTextEditor value={contentHtml} onChange={setContentHtml} />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Label>Published</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <div>
            <Label>SEO title</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>SEO description</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full rounded-xl" asChild>
            <Link href={`/${initialPage.slug}`} target="_blank">
              Preview live page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

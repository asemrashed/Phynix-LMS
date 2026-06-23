"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { uploadThumbnail } from "@/lib/upload"
import type { AdminBlogCategoryItem, AdminBlogPostDetail } from "@fxprime/types"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { BlogCategoryManager } from "@/components/admin/blog-category-manager"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/media-url"
import { ArrowLeft } from "lucide-react"

interface BlogEditorProps {
  mode: "create" | "edit"
  initialPost?: AdminBlogPostDetail
  categories: AdminBlogCategoryItem[]
  onCategoriesChange: (categories: AdminBlogCategoryItem[]) => void
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

const fieldClassName = "rounded-xl bg-white"

export function BlogEditor({
  mode,
  initialPost,
  categories,
  onCategoriesChange,
}: BlogEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [post, setPost] = useState<AdminBlogPostDetail | null>(initialPost ?? null)

  const [title, setTitle] = useState(initialPost?.title ?? "")
  const [slug, setSlug] = useState(initialPost?.slug ?? "")
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "")
  const [content, setContent] = useState(initialPost?.content ?? "<p></p>")
  const [categoryId, setCategoryId] = useState(
    initialPost?.categoryId ?? categories[0]?.id ?? ""
  )
  const [coverUrl, setCoverUrl] = useState(initialPost?.coverUrl ?? "")
  const [isPremium, setIsPremium] = useState(initialPost?.isPremium ?? false)
  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle ?? "")
  const [metaDesc, setMetaDesc] = useState(initialPost?.metaDesc ?? "")
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    initialPost?.publishedAt && initialPost.isScheduled
      ? new Date(initialPost.publishedAt)
      : undefined
  )

  const buildPayload = (options: { publishNow?: boolean; status?: string }) => ({
    title,
    slug: slug || slugify(title),
    excerpt: excerpt || undefined,
    content,
    categoryId,
    coverUrl: coverUrl || undefined,
    isPremium,
    metaTitle: metaTitle || undefined,
    metaDesc: metaDesc || undefined,
    publishedAt: scheduledAt?.toISOString() ?? null,
    publishNow: options.publishNow,
    status: options.status as "DRAFT" | "PUBLISHED" | undefined,
  })

  const save = async (options: { publishNow?: boolean; draft?: boolean }) => {
    if (!title.trim() || content.length < 10) {
      toast.error("Title and content are required")
      return
    }
    if (!categoryId) {
      toast.error("Select a category")
      return
    }

    setSaving(true)
    try {
      const payload = buildPayload({
        publishNow: options.publishNow,
        status: options.draft ? "DRAFT" : options.publishNow ? "PUBLISHED" : undefined,
      })

      if (mode === "create" || !post) {
        const created = await api<AdminBlogPostDetail>("/admin/blog", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        setPost(created)
        toast.success(
          created.isScheduled
            ? "Post scheduled"
            : created.status === "PUBLISHED"
              ? "Post published"
              : "Draft saved"
        )
        router.replace(`/admin/blog/${created.id}`)
        return created
      }

      const updated = await api<AdminBlogPostDetail>(`/admin/blog/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      setPost(updated)
      toast.success(
        updated.isScheduled
          ? "Schedule updated"
          : updated.status === "PUBLISHED"
            ? "Post published"
            : "Post saved"
      )
      return updated
    } catch {
      toast.error("Failed to save post")
      return null
    } finally {
      setSaving(false)
    }
  }

  const archive = async () => {
    if (!post) return
    try {
      const updated = await api<AdminBlogPostDetail>(`/admin/blog/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ARCHIVED" }),
      })
      setPost(updated)
      toast.success("Post archived")
    } catch {
      toast.error("Failed to archive post")
    }
  }

  const handleCoverUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadThumbnail(file)
      setCoverUrl(result.url)
      toast.success("Thumbnail uploaded")
    } catch {
      toast.error("Failed to upload thumbnail")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="rounded-xl" asChild>
        <Link href="/admin/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to blog
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "New Blog Post" : "Edit Blog Post"}
          </h1>
          {post && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{post.status}</Badge>
              {post.isScheduled && <Badge variant="secondary">Scheduled</Badge>}
              {post.isPremium && <Badge>Premium</Badge>}
              <span className="text-sm text-muted-foreground">/{post.slug}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <BlogCategoryManager categories={categories} onChange={onCategoriesChange} />
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={saving}
            onClick={() => save({ draft: true })}
          >
            Save Draft
          </Button>
          {scheduledAt && scheduledAt > new Date() ? (
            <Button
              className="rounded-xl"
              disabled={saving}
              onClick={() => save({ draft: true })}
            >
              {saving ? "Saving…" : "Schedule"}
            </Button>
          ) : (
            <Button
              className="rounded-xl"
              disabled={saving}
              onClick={() => save({ publishNow: true })}
            >
              {saving ? "Saving…" : "Publish"}
            </Button>
          )}
          {post?.status === "PUBLISHED" && (
            <Button variant="outline" className="rounded-xl" onClick={archive}>
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              className={fieldClassName}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (mode === "create" && !slug) setSlug(slugify(e.target.value))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              className={fieldClassName}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              className={fieldClassName}
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary for listings"
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-[20px] bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Settings</h2>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className={cn(fieldClassName, "w-full")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isPremium} onCheckedChange={setIsPremium} />
              <Label>Premium content</Label>
            </div>

            <div className="space-y-2">
              <Label>Schedule publish</Label>
              <DateTimePicker
                value={scheduledAt}
                onChange={setScheduledAt}
                fromDate={new Date()}
                placeholder="Publish immediately"
                className="bg-white"
              />
              {scheduledAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-0 text-muted-foreground"
                  onClick={() => setScheduledAt(undefined)}
                >
                  Clear schedule
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-[20px] bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Thumbnail</h2>
            {coverUrl && (
              <img
                src={getMediaUrl(coverUrl) ?? coverUrl}
                alt="Thumbnail"
                className="aspect-video w-full rounded-xl object-cover"
              />
            )}
            <Input
              className={fieldClassName}
              placeholder="Image URL"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              className={fieldClassName}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleCoverUpload(file)
              }}
            />
            <p className="text-xs text-muted-foreground">
              Shown on the blog list and public blog pages.
            </p>
          </div>

          <div className="space-y-4 rounded-[20px] bg-card p-5 shadow-sm">
            <h2 className="font-semibold">SEO</h2>
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input
                id="metaTitle"
                className={fieldClassName}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Defaults to post title"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDesc">Meta description</Label>
              <Textarea
                id="metaDesc"
                className={fieldClassName}
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder={excerpt || "Defaults to excerpt"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { uploadThumbnail } from "@/lib/upload"
import type { TestimonialItem, TestimonialType } from "@fxprime/types"
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

interface TestimonialEditorProps {
  mode: "create" | "edit"
  initial?: TestimonialItem
}

const TYPES: TestimonialType[] = ["VIDEO", "SCREENSHOT", "TRUSTPILOT", "TEXT"]

export function TestimonialEditor({ mode, initial }: TestimonialEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState<TestimonialType>(initial?.type ?? "TEXT")
  const [title, setTitle] = useState(initial?.title ?? "")
  const [content, setContent] = useState(initial?.content ?? "")
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? "")
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "")
  const [authorPhoto, setAuthorPhoto] = useState(initial?.authorPhoto ?? "")
  const [rating, setRating] = useState(String(initial?.rating ?? ""))
  const [courseName, setCourseName] = useState(initial?.courseName ?? "")
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0))
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true)

  const save = async () => {
    if (!authorName.trim()) {
      toast.error("Author name is required")
      return
    }

    setSaving(true)
    try {
      const body = {
        type,
        title: title || undefined,
        content: content || undefined,
        mediaUrl: mediaUrl || undefined,
        authorName,
        authorPhoto: authorPhoto || undefined,
        rating: rating ? Number(rating) : undefined,
        courseName: courseName || undefined,
        sortOrder: Number(sortOrder) || 0,
        isPublished,
      }

      if (mode === "create") {
        const created = await api<TestimonialItem>("/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(body),
        })
        toast.success("Testimonial created")
        router.replace(`/admin/testimonials/${created.id}`)
        return
      }

      await api(`/admin/testimonials/${initial!.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      toast.success("Testimonial saved")
    } catch {
      toast.error("Failed to save testimonial")
    } finally {
      setSaving(false)
    }
  }

  const uploadPhoto = async (file: File) => {
    try {
      const result = await uploadThumbnail(file)
      setAuthorPhoto(result.url)
      toast.success("Photo uploaded")
    } catch {
      toast.error("Upload failed")
    }
  }

  const uploadMedia = async (file: File) => {
    try {
      const result = await uploadThumbnail(file)
      setMediaUrl(result.url)
      toast.success("Media uploaded")
    } catch {
      toast.error("Upload failed")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "New Testimonial" : "Edit Testimonial"}
          </h1>
          {initial && (
            <Badge variant="outline" className="mt-1">
              {initial.isPublished ? "Published" : "Draft"}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/testimonials">
            <Button variant="outline" className="rounded-xl">
              Back
            </Button>
          </Link>
          <Button className="rounded-xl" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as TestimonialType)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorName">Author name</Label>
          <Input
            id="authorName"
            className="rounded-xl"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            className="rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title or label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Review text</Label>
          <Textarea
            id="content"
            className="rounded-xl"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="For TEXT, TRUSTPILOT types"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mediaUrl">
            Media URL {type === "VIDEO" ? "(YouTube link)" : "(image URL)"}
          </Label>
          <Input
            id="mediaUrl"
            className="rounded-xl"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
          {(type === "SCREENSHOT" || type === "TEXT") && (
            <Input
              type="file"
              accept="image/*"
              className="rounded-xl"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadMedia(file)
              }}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              className="rounded-xl"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              type="number"
              className="rounded-xl"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseName">Course name (optional)</Label>
          <Input
            id="courseName"
            className="rounded-xl"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Author photo</Label>
          <Input
            className="rounded-xl"
            value={authorPhoto}
            onChange={(e) => setAuthorPhoto(e.target.value)}
            placeholder="URL or upload below"
          />
          <Input
            type="file"
            accept="image/*"
            className="rounded-xl"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadPhoto(file)
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <Label>Published on homepage</Label>
        </div>
      </div>
    </div>
  )
}

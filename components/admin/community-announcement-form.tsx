"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import type { AdminCommunityPostItem } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CommunityAnnouncementFormProps {
  mode: "create" | "edit"
  initialPost?: AdminCommunityPostItem
}

export function CommunityAnnouncementForm({
  mode,
  initialPost,
}: CommunityAnnouncementFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialPost?.title ?? "")
  const [content, setContent] = useState(initialPost?.content ?? "")
  const [isPinned, setIsPinned] = useState(initialPost?.isPinned ?? true)
  const [isHidden, setIsHidden] = useState(initialPost?.isHidden ?? false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setSaving(true)
    try {
      if (mode === "create") {
        const created = await api<AdminCommunityPostItem>("/admin/community", {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            isPinned,
            isHidden,
          }),
        })
        toast.success(isHidden ? "Announcement saved as hidden" : "Announcement published")
        router.replace(`/admin/community/${created.id}`)
        return
      }

      if (!initialPost) return

      await api<AdminCommunityPostItem>(`/admin/community/${initialPost.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          isPinned,
          isHidden,
        }),
      })
      toast.success("Announcement updated")
      router.push(`/admin/community/${initialPost.id}`)
    } catch {
      toast.error(mode === "create" ? "Failed to publish announcement" : "Failed to update announcement")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="rounded-xl" asChild>
        <Link href="/admin/community">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to community
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Announcement" : "Edit Announcement"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish an official post to the community feed. Pinned announcements appear at the top.
        </p>
      </div>

      <div className="max-w-2xl space-y-6 rounded-[20px] border border-border bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            className="rounded-xl bg-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            className="min-h-[200px] rounded-xl bg-white"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share updates, events, or important information…"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-3">
            <Switch id="isPinned" checked={isPinned} onCheckedChange={setIsPinned} />
            <Label htmlFor="isPinned">Pin to top of community</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="isHidden" checked={isHidden} onCheckedChange={setIsHidden} />
            <Label htmlFor="isHidden">Publish hidden (draft)</Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="rounded-xl" disabled={saving} onClick={handleSubmit}>
            {saving
              ? "Saving…"
              : mode === "create"
                ? isHidden
                  ? "Save hidden"
                  : "Publish"
                : "Save changes"}
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin/community">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminCommunityPostDetail } from "@fxprime/types"
import { CommunityAnnouncementForm } from "@/components/admin/community-announcement-form"
import { Spinner } from "@/components/ui/spinner"

export default function EditCommunityAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<AdminCommunityPostDetail["post"] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<AdminCommunityPostDetail>(`/admin/community/${postId}`)
      .then((detail) => {
        if (detail.post.parentId) {
          router.push("/admin/community")
          return
        }
        setPost(detail.post)
      })
      .catch(() => router.push("/admin/community"))
      .finally(() => setLoading(false))
  }, [postId, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!post) return null

  return <CommunityAnnouncementForm mode="edit" initialPost={post} />
}

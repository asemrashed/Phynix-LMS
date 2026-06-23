"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminBlogCategoryItem, AdminBlogPostDetail } from "@fxprime/types"
import { BlogEditor } from "@/components/admin/blog-editor"
import { Spinner } from "@/components/ui/spinner"

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<AdminBlogPostDetail | null>(null)
  const [categories, setCategories] = useState<AdminBlogCategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<AdminBlogPostDetail>(`/admin/blog/${postId}`),
      api<AdminBlogCategoryItem[]>("/admin/blog/categories"),
    ])
      .then(([p, c]) => {
        setPost(p)
        setCategories(c)
      })
      .catch(() => router.push("/admin/blog"))
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

  return (
    <BlogEditor
      mode="edit"
      initialPost={post}
      categories={categories}
      onCategoriesChange={setCategories}
    />
  )
}

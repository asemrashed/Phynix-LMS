"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AdminBlogCategoryItem } from "@fxprime/types"
import { BlogEditor } from "@/components/admin/blog-editor"

export default function NewBlogPostPage() {
    const [categories, setCategories] = useState<AdminBlogCategoryItem[]>([])

  useEffect(() => {
    api<AdminBlogCategoryItem[]>("/admin/blog/categories")
      .then(setCategories)
      .catch(console.error)
  }, [])

  return (
    <BlogEditor
      mode="create"
      categories={categories}
      onCategoriesChange={setCategories}
    />
  )
}

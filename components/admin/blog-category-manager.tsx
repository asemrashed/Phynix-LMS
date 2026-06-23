"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import type { AdminBlogCategoryItem } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface BlogCategoryManagerProps {
  categories: AdminBlogCategoryItem[]
  onChange: (categories: AdminBlogCategoryItem[]) => void
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function BlogCategoryManager({ categories, onChange }: BlogCategoryManagerProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      const category = await api<AdminBlogCategoryItem>("/admin/blog/categories", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug || slugify(name),
        }),
      })
      onChange([...categories, category].sort((a, b) => a.name.localeCompare(b.name)))
      setName("")
      setSlug("")
      toast.success("Category created")
    } catch {
      toast.error("Failed to create category")
    }
  }

  const handleDelete = async (category: AdminBlogCategoryItem) => {
    if (category.postCount > 0) {
      toast.error("Cannot delete category with posts")
      return
    }
    try {
      await api(`/admin/blog/categories/${category.id}`, { method: "DELETE" })
      onChange(categories.filter((c) => c.id !== category.id))
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Blog Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cat-name">New category</Label>
            <Input
              id="cat-name"
              className="rounded-xl"
              placeholder="Category name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slug) setSlug(slugify(e.target.value))
              }}
            />
            <Input
              className="rounded-xl"
              placeholder="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Button className="rounded-xl w-full" onClick={handleCreate}>
              Add Category
            </Button>
          </div>

          <div className="max-h-60 space-y-2 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{category.slug} · {category.postCount} posts
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-xl text-destructive"
                  disabled={category.postCount > 0}
                  onClick={() => handleDelete(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

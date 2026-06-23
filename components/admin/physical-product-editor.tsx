"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { uploadProductImages } from "@/lib/upload"
import type { AdminPhysicalProductDetail } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Link from "next/link"
import { Trash2 } from "lucide-react"

interface PhysicalProductEditorProps {
  mode: "create" | "edit"
  initialProduct?: AdminPhysicalProductDetail
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function PhysicalProductEditor({ mode, initialProduct }: PhysicalProductEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [product, setProduct] = useState<AdminPhysicalProductDetail | null>(
    initialProduct ?? null
  )

  const [name, setName] = useState(initialProduct?.name ?? "")
  const [slug, setSlug] = useState(initialProduct?.slug ?? "")
  const [description, setDescription] = useState(initialProduct?.description ?? "")
  const [price, setPrice] = useState(String(initialProduct?.price ?? 0))
  const [stock, setStock] = useState(String(initialProduct?.stock ?? 0))
  const [weight, setWeight] = useState(
    initialProduct?.weight != null ? String(initialProduct.weight) : ""
  )
  const [images, setImages] = useState<string[]>(initialProduct?.images ?? [])
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? false)

  const save = async (activate?: boolean) => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    setSaving(true)
    try {
      const body = {
        name,
        slug: slug || slugify(name),
        description: description || undefined,
        price: Number(price) || 0,
        currency: "BDT",
        stock: Number(stock) || 0,
        weight: weight ? Number(weight) : undefined,
        images,
        isActive: activate ?? isActive,
      }

      if (mode === "create" || !product) {
        const created = await api<AdminPhysicalProductDetail>("/admin/products/physical", {
          method: "POST",
          body: JSON.stringify(body),
        })
        setProduct(created)
        toast.success(created.isActive ? "Product published" : "Product saved")
        router.replace(`/admin/products/physical/${created.id}`)
        return
      }

      const updated = await api<AdminPhysicalProductDetail>(
        `/admin/products/physical/${product.id}`,
        { method: "PATCH", body: JSON.stringify(body) }
      )
      setProduct(updated)
      setIsActive(updated.isActive)
      toast.success("Product saved")
    } catch {
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploadingImages(true)
    try {
      const result = await uploadProductImages(Array.from(files))
      setImages((prev) => [...prev, ...result.urls])
      toast.success(`${result.urls.length} image(s) uploaded`)
    } catch {
      toast.error("Failed to upload images")
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "New Physical Product" : "Edit Physical Product"}
          </h1>
          {product && (
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline">{product.isActive ? "Active" : "Inactive"}</Badge>
              <span className="text-sm text-muted-foreground">/{product.slug}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button variant="outline" className="rounded-xl">
              Back
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={saving}
            onClick={() => save(false)}
          >
            Save
          </Button>
          <Button className="rounded-xl" disabled={saving} onClick={() => save(true)}>
            {saving ? "Saving…" : "Save & Activate"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="rounded-xl"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (mode === "create" && !slug) setSlug(slugify(e.target.value))
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            className="rounded-xl"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            className="rounded-xl"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (BDT)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              className="rounded-xl"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              className="rounded-xl"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={0}
              step="0.01"
              className="rounded-xl"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active (visible in store)</Label>
        </div>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Product Images</h2>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url) => (
              <div key={url} className="group relative">
                <img
                  src={url}
                  alt="Product"
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-7 w-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeImage(url)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          multiple
          className="rounded-xl"
          disabled={uploadingImages}
          onChange={(e) => handleImageUpload(e.target.files)}
        />
        <p className="text-xs text-muted-foreground">
          Upload multiple images. First image is used as the primary.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { uploadDigitalFile, uploadThumbnail } from "@/lib/upload"
import type { AdminDigitalProductDetail, DigitalProductType } from "@fxprime/types"
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

const PRODUCT_TYPES: DigitalProductType[] = [
  "PDF",
  "EBOOK",
  "TRADING_JOURNAL",
  "TEMPLATE",
  "INDICATOR",
  "TOOL",
  "BUNDLE",
]

interface DigitalProductEditorProps {
  mode: "create" | "edit"
  initialProduct?: AdminDigitalProductDetail
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DigitalProductEditor({ mode, initialProduct }: DigitalProductEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [product, setProduct] = useState<AdminDigitalProductDetail | null>(
    initialProduct ?? null
  )

  const [title, setTitle] = useState(initialProduct?.title ?? "")
  const [slug, setSlug] = useState(initialProduct?.slug ?? "")
  const [description, setDescription] = useState(initialProduct?.description ?? "")
  const [type, setType] = useState<DigitalProductType>(initialProduct?.type ?? "PDF")
  const [thumbnailUrl, setThumbnailUrl] = useState(initialProduct?.thumbnailUrl ?? "")
  const [fileKey, setFileKey] = useState(initialProduct?.fileKey ?? "")
  const [fileSize, setFileSize] = useState(initialProduct?.fileSize ?? 0)
  const [price, setPrice] = useState(String(initialProduct?.price ?? 0))
  const [maxDownloads, setMaxDownloads] = useState(
    String(initialProduct?.maxDownloads ?? 10)
  )
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? false)

  const save = async (activate?: boolean) => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!fileKey) {
      toast.error("Upload a product file first")
      return
    }

    setSaving(true)
    try {
      const body = {
        title,
        slug: slug || slugify(title),
        description: description || undefined,
        type,
        thumbnailUrl: thumbnailUrl || undefined,
        fileKey,
        fileSize,
        price: Number(price) || 0,
        maxDownloads: Number(maxDownloads) || 10,
        isActive: activate ?? isActive,
      }

      if (mode === "create" || !product) {
        const created = await api<AdminDigitalProductDetail>("/admin/products/digital", {
          method: "POST",
          body: JSON.stringify(body),
        })
        setProduct(created)
        toast.success(created.isActive ? "Product published" : "Product saved")
        router.replace(`/admin/products/digital/${created.id}`)
        return
      }

      const updated = await api<AdminDigitalProductDetail>(
        `/admin/products/digital/${product.id}`,
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

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true)
    try {
      const result = await uploadDigitalFile(file)
      setFileKey(result.fileKey)
      setFileSize(result.fileSize)
      toast.success("File uploaded")
    } catch {
      toast.error("Failed to upload file")
    } finally {
      setUploadingFile(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "New Digital Product" : "Edit Digital Product"}
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
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            className="rounded-xl"
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DigitalProductType)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxDownloads">Download limit per purchase</Label>
          <Input
            id="maxDownloads"
            type="number"
            min={1}
            className="rounded-xl w-32"
            value={maxDownloads}
            onChange={(e) => setMaxDownloads(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active (visible in store)</Label>
        </div>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Product File</h2>
        {fileKey && (
          <p className="text-sm text-muted-foreground">
            {fileKey} · {formatFileSize(fileSize)}
          </p>
        )}
        <Input
          type="file"
          accept=".pdf,.zip,.xlsx,.xls,.txt,.ex4,.mq4,.tpl"
          className="rounded-xl"
          disabled={uploadingFile}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
        />
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Thumbnail</h2>
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="h-32 w-32 rounded-xl object-cover"
          />
        )}
        <Input
          className="rounded-xl"
          placeholder="Thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
        />
        <Input
          type="file"
          accept="image/*"
          className="rounded-xl"
          disabled={uploadingThumb}
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setUploadingThumb(true)
            try {
              const result = await uploadThumbnail(file)
              setThumbnailUrl(result.url)
              toast.success("Thumbnail uploaded")
            } catch {
              toast.error("Failed to upload thumbnail")
            } finally {
              setUploadingThumb(false)
            }
          }}
        />
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminDigitalProductDetail } from "@fxprime/types"
import { DigitalProductEditor } from "@/components/admin/digital-product-editor"
import { Spinner } from "@/components/ui/spinner"

export default function EditDigitalProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<AdminDigitalProductDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<AdminDigitalProductDetail>(`/admin/products/digital/${productId}`)
      .then(setProduct)
      .catch(() => router.push("/admin/products"))
      .finally(() => setLoading(false))
  }, [productId, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!product) return null

  return <DigitalProductEditor mode="edit" initialProduct={product} />
}

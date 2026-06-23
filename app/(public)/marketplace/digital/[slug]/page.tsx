"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { createSSLPayment, processPayment } from "@/lib/payment"
import { useAuth } from "@/lib/auth-context"
import type { MarketplaceProductDetail } from "@fxprime/types"
import { getMediaUrl } from "@/lib/media-url"
import { ChevronLeft, Download, Loader2, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { handleVerificationError } from "@/lib/verification"
import { getSettingsPath } from "@/lib/get-default-panel"
import { SaveButton } from "@/components/save-button"

import { formatPrice } from "@/lib/money"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DigitalProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<MarketplaceProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    api<MarketplaceProductDetail>(`/products/digital/by-slug/${slug}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handlePurchase = async () => {
    if (!product || !user) {
      router.push(`/login?redirect=/marketplace/digital/${slug}`)
      return
    }
    setPurchasing(true)
    try {
      if (product.price === 0) {
        await api(`/products/digital/${product.id}/purchase`, {
          method: "POST",
          body: JSON.stringify({}),
        })
        toast.success("Product added to your library!")
        const updated = await api<MarketplaceProductDetail>(
          `/products/digital/by-slug/${slug}`
        )
        setProduct(updated)
      } else {
        const result = await createSSLPayment({
          type: "digital_product",
          productId: product.id,
        })
        const redirected = await processPayment(result)
        if (redirected) return
        toast.success("Purchase complete!")
      }
    } catch (err) {
      if (
        handleVerificationError(err, () => {
          toast.error("Verify your email before purchasing")
          router.push(getSettingsPath(user?.role))
        })
      ) {
        return
      }
      toast.error("Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link href="/marketplace">
          <Button className="mt-4 rounded-xl">Back to Marketplace</Button>
        </Link>
      </main>
    )
  }

  const thumb = getMediaUrl(product.thumbnailUrl)

  return (
    <main className="container mx-auto px-4 py-8">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="mb-6 rounded-xl">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Marketplace
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[24px] border border-border bg-card">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-muted">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Download className="h-20 w-20 text-primary/30" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-lg">Digital</Badge>
                <Badge variant="outline" className="rounded-lg">
                  {product.category.replace(/_/g, " ")}
                </Badge>
                {product.isPurchased && (
                  <Badge variant="secondary" className="rounded-lg">Owned</Badge>
                )}
                <SaveButton
                  entityType="DIGITAL_PRODUCT"
                  entityId={product.id}
                  mode="wishlist"
                  size="sm"
                  showLabel
                />
              </div>
              <h1 className="mt-4 text-3xl font-bold text-foreground">{product.title}</h1>
              <p className="mt-4 text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {product.fileSize ? (
              <p className="text-sm text-muted-foreground">
                File size: {formatFileSize(product.fileSize)}
              </p>
            ) : null}

            {product.isPurchased ? (
              <Link href="/dashboard/products">
                <Button className="rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Go to Library
                </Button>
              </Link>
            ) : (
              <Button
                className="rounded-xl"
                size="lg"
                disabled={purchasing}
                onClick={handlePurchase}
              >
                {purchasing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {product.price === 0 ? "Get Free" : "Buy Now"}
              </Button>
            )}
          </div>
        </div>
    </main>
  )
}

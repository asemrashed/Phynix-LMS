"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import type { MarketplaceProductDetail } from "@fxprime/types"
import { getMediaUrl } from "@/lib/media-url"
import { ChevronLeft, Loader2, Package, ShoppingBag, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { toast } from "sonner"
import { SaveButton } from "@/components/save-button"

import { formatPrice } from "@/lib/money"

export default function PhysicalProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<MarketplaceProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    api<MarketplaceProductDetail>(`/products/physical/by-slug/${slug}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

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

  const images = product.images.length
    ? product.images
    : product.thumbnailUrl
      ? [product.thumbnailUrl]
      : []
  const mainImage = getMediaUrl(images[activeImage])
  const inStock = (product.stock ?? 0) > 0

  return (
    <main className="container mx-auto px-4 py-8">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="mb-6 rounded-xl">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Marketplace
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[24px] border border-border bg-card">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-muted">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-20 w-20 text-primary/30" />
                  </div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => {
                  const src = getMediaUrl(img)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                        i === activeImage ? "border-primary" : "border-transparent"
                      }`}
                    >
                      {src && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-lg">Physical</Badge>
                <Badge
                  variant={inStock ? "outline" : "destructive"}
                  className="rounded-lg"
                >
                  {inStock ? `${product.stock} in stock` : "Out of stock"}
                </Badge>
                <SaveButton
                  entityType="PHYSICAL_PRODUCT"
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

            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Free shipping on orders over ৳1,000
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/checkout/product?productId=${product.id}`}>
                <Button className="rounded-xl" size="lg" disabled={!inStock}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {inStock ? "Buy Now" : "Out of Stock"}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-xl"
                size="lg"
                disabled={!inStock}
                onClick={() => {
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    title: product.title,
                    price: product.price,
                    currency: product.currency,
                    stock: product.stock ?? 0,
                    thumbnailUrl: product.thumbnailUrl,
                  })
                  toast.success("Added to cart")
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Link href="/cart">
                <Button variant="outline" className="rounded-xl" size="lg">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
    </main>
  )
}

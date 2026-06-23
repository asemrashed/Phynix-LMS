"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { MarketplaceProductItem } from "@fxprime/types"
import { getMediaUrl } from "@/lib/media-url"
import { cn } from "@/lib/utils"
import { Package, Download, ShoppingBag } from "lucide-react"
import { SaveButton } from "@/components/save-button"

interface ProductCardProps {
  product: MarketplaceProductItem
  className?: string
}

import { formatPrice } from "@/lib/money"

function categoryLabel(category: string): string {
  return category.replace(/_/g, " ")
}

export function ProductCard({ product, className }: ProductCardProps) {
  const href =
    product.productType === "digital"
      ? `/marketplace/digital/${product.slug}`
      : `/marketplace/physical/${product.slug}`
  const thumb = getMediaUrl(product.thumbnailUrl)

  const entityType =
    product.productType === "digital" ? "DIGITAL_PRODUCT" : "PHYSICAL_PRODUCT"

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      <div className="absolute right-3 top-3 z-10">
        <SaveButton entityType={entityType} entityId={product.id} mode="wishlist" />
      </div>
      <Link href={href}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-muted">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={product.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              {product.productType === "digital" ? (
                <Download className="h-12 w-12 text-primary/30" />
              ) : (
                <ShoppingBag className="h-12 w-12 text-primary/30" />
              )}
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="secondary" className="rounded-lg capitalize">
              {product.productType}
            </Badge>
            {product.isPurchased && (
              <Badge className="rounded-lg">Owned</Badge>
            )}
          </div>
        </div>
        <div className="p-4">
          <Badge variant="outline" className="mb-2 rounded-lg text-[10px] uppercase">
            {categoryLabel(product.category)}
          </Badge>
          <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
            {product.title}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.productType === "physical" && product.stock !== undefined && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

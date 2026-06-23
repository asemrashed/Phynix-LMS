"use client"

import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"
import { Badge } from "@/components/ui/badge"
import type { SearchResultItem } from "@fxprime/types"
import { getMediaUrl } from "@/lib/media-url"
import { BookOpen, FileText, Package } from "lucide-react"

import { formatPrice } from "@/lib/money"

function typeLabel(item: SearchResultItem): string {
  if (item.type === "course") return "Course"
  if (item.type === "blog") return "Blog"
  return item.productType === "physical" ? "Physical Product" : "Digital Product"
}

function TypeIcon({ item }: { item: SearchResultItem }) {
  if (item.type === "course") return <BookOpen className="h-5 w-5 text-primary" />
  if (item.type === "blog") return <FileText className="h-5 w-5 text-primary" />
  return <Package className="h-5 w-5 text-primary" />
}

interface SearchResultCardProps {
  item: SearchResultItem
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  const thumb = getMediaUrl(item.thumbnailUrl)

  return (
    <Link
      href={item.href}
      className="flex gap-4 rounded-[20px] bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {thumb ? (
          <AppImage
            src={thumb}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <TypeIcon item={item} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {typeLabel(item)}
          </Badge>
          {item.subtitle && (
            <span className="text-xs text-muted-foreground">{item.subtitle}</span>
          )}
          {item.price !== undefined && (
            <span className="text-sm font-semibold text-primary">
              {formatPrice(item.price)}
            </span>
          )}
        </div>
        <p className="line-clamp-2 font-medium text-foreground">{item.title}</p>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  )
}

"use client"

import { useEffect, useState } from "react"
import { BLOG_COVER_PLACEHOLDER, getBlogCoverUrl } from "@/lib/media-url"

interface BlogCoverImageProps {
  coverUrl: string | null | undefined
  alt: string
  className?: string
}

export function BlogCoverImage({ coverUrl, alt, className }: BlogCoverImageProps) {
  const [src, setSrc] = useState(() => getBlogCoverUrl(coverUrl))

  useEffect(() => {
    setSrc(getBlogCoverUrl(coverUrl))
  }, [coverUrl])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        setSrc((current) =>
          current === BLOG_COVER_PLACEHOLDER ? current : BLOG_COVER_PLACEHOLDER
        )
      }}
    />
  )
}

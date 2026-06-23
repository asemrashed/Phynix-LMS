"use client"

import Image, { type ImageProps } from "next/image"
import { canUseNextImage } from "@/lib/next-image"
import { cn } from "@/lib/utils"

type AppImageProps = ImageProps

export function AppImage({ src, alt, className, fill, style, ...props }: AppImageProps) {
  const srcStr = typeof src === "string" ? src : ""

  if (!canUseNextImage(srcStr)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={srcStr}
          alt={alt}
          className={cn("object-cover", className)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            ...style,
          }}
        />
      )
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={srcStr}
        alt={alt}
        className={className}
        width={typeof props.width === "number" ? props.width : undefined}
        height={typeof props.height === "number" ? props.height : undefined}
        style={style}
      />
    )
  }

  return (
    <Image src={src} alt={alt} className={className} fill={fill} style={style} {...props} />
  )
}

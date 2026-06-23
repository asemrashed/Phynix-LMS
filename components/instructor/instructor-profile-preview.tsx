"use client"

import Image from "next/image"
import { getMediaUrl } from "@/lib/media-url"

interface InstructorProfilePreviewProps {
  displayName: string
  bio?: string | null
  photoUrl?: string | null
}

export function InstructorProfilePreview({
  displayName,
  bio,
  photoUrl,
}: InstructorProfilePreviewProps) {
  const photoSrc = getMediaUrl(photoUrl)

  if (!bio && !photoSrc) return null

  return (
    <div className="rounded-[20px] border border-dashed border-border bg-muted/30 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Public preview
      </p>
      <div className="flex gap-4 rounded-[20px] bg-card p-5">
        {photoSrc && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <Image
              src={photoSrc}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{displayName || "Your name"}</p>
          {bio ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{bio}</p>
          ) : (
            <p className="mt-1 text-sm italic text-muted-foreground">
              Add a bio to appear on course pages.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

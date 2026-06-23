"use client"

import { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { apiUpload } from "@/lib/api"
import { getMediaUrl } from "@/lib/media-url"
import type { AuthUser } from "@fxprime/types"
import { toast } from "sonner"

interface AvatarUploadProps {
  user: AuthUser
  onUpdated: (user: AuthUser) => void
  size?: "sm" | "lg"
}

export function AvatarUpload({ user, onUpdated, size = "lg" }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const student = user.student
  const initials = student
    ? `${student.firstName[0]}${student.lastName[0]}`
    : "U"
  const avatarSrc = getMediaUrl(student?.avatarUrl)

  const dimensions = size === "lg" ? "h-24 w-24" : "h-16 w-16"

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)
      const updated = await apiUpload<AuthUser>("/auth/avatar", formData)
      onUpdated(updated)
      toast.success("Avatar updated")
    } catch {
      toast.error("Failed to upload avatar")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={dimensions}>
          {avatarSrc && <AvatarImage src={avatarSrc} alt="Profile avatar" />}
          <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ""
        }}
      />
      <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 2MB</p>
    </div>
  )
}

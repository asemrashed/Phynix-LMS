"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import type { InstructorProfile } from "@fxprime/types"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { InstructorPhotoUpload } from "@/components/instructor/instructor-photo-upload"
import { InstructorProfilePreview } from "@/components/instructor/instructor-profile-preview"
import { useInstructorProfile } from "@/lib/hooks/use-instructor-data"
import {
  InstructorPanelError,
  InstructorPanelLoading,
} from "@/components/instructor/instructor-panel-state"

export default function InstructorSettingsPage() {
  const { data: profile, loading, error, refetch } = useInstructorProfile()
  const [displayName, setDisplayName] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName)
    setTitle(profile.title ?? "")
    setBio(profile.bio ?? "")
    setPhotoUrl(profile.photoUrl)
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api<InstructorProfile>("/instructor/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName.trim(),
          title: title.trim() || null,
          bio: bio.trim() || null,
        }),
      })
      setDisplayName(updated.displayName)
      setTitle(updated.title ?? "")
      setBio(updated.bio ?? "")
      setPhotoUrl(updated.photoUrl)
      toast.success("Profile updated")
      refetch()
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <InstructorPanelLoading />
  if (error || !profile) {
    return (
      <InstructorPanelError message={error ?? "Unable to load profile."} onRetry={refetch} />
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Settings</h1>
      <p className="mb-8 text-muted-foreground">Manage your instructor profile</p>

      <div className="space-y-6 rounded-[20px] bg-card p-6 shadow-sm">
        <InstructorPhotoUpload
          profile={{ ...profile, displayName, bio, photoUrl }}
          onUpdated={(updated) => {
            setPhotoUrl(updated.photoUrl)
            refetch()
          }}
        />
        <div>
          <Label>Email</Label>
          <Input className="mt-1 rounded-xl" value={profile.email} disabled />
        </div>
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            className="mt-1 rounded-xl"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="title">Professional title</Label>
          <Input
            id="title"
            className="mt-1 rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Financial Market Analyst"
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            className="mt-1 min-h-[120px] rounded-xl"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell students about your teaching experience..."
          />
        </div>

        <InstructorProfilePreview
          displayName={displayName}
          bio={bio}
          photoUrl={photoUrl}
        />

        <Button className="rounded-xl" onClick={handleSave} disabled={saving || !displayName.trim()}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import type { AuthUser, UpdateProfileRequest, SubscriptionInfo } from "@fxprime/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { REGISTER_COUNTRIES } from "@/lib/countries"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { SubscriptionCard } from "@/components/subscription-card"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { AddressBook } from "@/components/profile/address-book"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const student = user?.student
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [saving, setSaving] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  useEffect(() => {
    api<SubscriptionInfo>("/subscription/me").then(setSubscription).catch(() => {})
  }, [])

  useEffect(() => {
    if (!student) return
    setFirstName(student.firstName)
    setLastName(student.lastName)
    setPhone(student.phone || "")
    setCountry(student.country)
  }, [student])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: UpdateProfileRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
      }
      await api<AuthUser>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      await refreshUser()
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <section className="min-w-0 space-y-6 rounded-[20px] bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>

          {user && (
            <AvatarUpload
              user={user}
              onUpdated={async () => {
                await refreshUser()
              }}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                className="mt-1 rounded-xl"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                className="mt-1 rounded-xl"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input className="mt-1 rounded-xl" value={user?.email || ""} readOnly />
            </div>
            <div>
              <Label>Student ID</Label>
              <Input
                className="mt-1 rounded-xl font-mono"
                value={student?.uniqueStudentId || "Available after your first course enrollment"}
                readOnly
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                className="mt-1 rounded-xl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country" className="mt-1 rounded-xl">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {REGISTER_COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              className="rounded-xl"
              onClick={handleSave}
              disabled={saving || !firstName.trim() || !lastName.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-6">
          {subscription && (
            <SubscriptionCard subscription={subscription} onUpdate={setSubscription} />
          )}
          <AddressBook />
        </aside>
      </div>
    </div>
  )
}

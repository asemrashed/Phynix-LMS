"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminUserDetail, Role } from "@fxprime/types"
import { AdminCourseSelect } from "@/components/admin/admin-course-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { Monitor, Smartphone } from "lucide-react"

const ASSIGNABLE_ROLES: Role[] = ["STUDENT", "ADMIN"]

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, refreshUser, logout } = useAuth()
  const userId = params.id as string

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grantCourseId, setGrantCourseId] = useState("")
  const [grantOpen, setGrantOpen] = useState(false)

  const loadUser = () =>
    api<AdminUserDetail>(`/admin/users/${userId}`).then(setUser)

  useEffect(() => {
    api<AdminUserDetail>(`/admin/users/${userId}`)
      .then(setUser)
      .catch(() => router.push("/admin/users"))
      .finally(() => setLoading(false))
  }, [userId, router])

  const updateUser = async (patch: { isActive?: boolean; role?: Role }) => {
    setSaving(true)
    try {
      const previousRole = user?.role
      const updated = await api<AdminUserDetail>(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
      setUser(updated)
      if (patch.role && patch.role !== previousRole) {
        if (currentUser?.id === userId) {
          toast.info("Your role changed. Please sign in again.")
          await logout()
          router.push("/login")
          return
        }
        toast.success("Role updated. User must sign in again.")
      } else {
        toast.success("User updated")
      }
      if (currentUser?.id === userId && patch.role) {
        await refreshUser()
      }
    } catch {
      toast.error("Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  const grantEnrollment = async () => {
    if (!grantCourseId) return
    try {
      await api(`/admin/users/${userId}/enrollments`, {
        method: "POST",
        body: JSON.stringify({ courseId: grantCourseId }),
      })
      await loadUser()
      setGrantOpen(false)
      toast.success("Enrollment granted")
    } catch {
      toast.error("Failed to grant enrollment")
    }
  }

  const resetDevices = async () => {
    try {
      const result = await api<{ resetCount: number }>(
        `/admin/users/${userId}/reset-devices`,
        { method: "POST" }
      )
      await loadUser()
      toast.success(`Reset ${result.resetCount} device session(s)`)
    } catch {
      toast.error("Failed to reset devices")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) return null

  const isSuperAdmin = user.role === "SUPER_ADMIN"

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{user.studentName || user.email}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.uniqueStudentId && (
            <p className="text-xs text-muted-foreground">{user.uniqueStudentId}</p>
          )}
        </div>
        <Link href="/admin/users">
          <Button variant="outline" className="rounded-xl">Back</Button>
        </Link>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Account</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{user.role}</Badge>
          <Badge variant={user.isActive ? "default" : "destructive"}>
            {user.isActive ? "Active" : "Banned"}
          </Badge>
          {user.isVerified ? (
            <Badge variant="secondary">Verified</Badge>
          ) : (
            <Badge variant="outline">Unverified</Badge>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={user.role}
              onValueChange={(v) => updateUser({ role: v as Role })}
              disabled={saving || isSuperAdmin}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
                {isSuperAdmin && (
                  <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant={user.isActive ? "destructive" : "default"}
              className="rounded-xl w-full"
              disabled={saving || isSuperAdmin}
              onClick={() => updateUser({ isActive: !user.isActive })}
            >
              {user.isActive ? "Ban User" : "Activate User"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
        </p>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Enrollments</h2>
          {user.studentId && (
            <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl">
                  Grant Enrollment
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Grant course enrollment</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <AdminCourseSelect
                    value={grantCourseId}
                    onChange={setGrantCourseId}
                    publishedOnly
                    placeholder="Select course"
                  />
                  <Button className="rounded-xl w-full" onClick={grantEnrollment}>
                    Grant access
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!user.studentId && (
          <p className="text-sm text-muted-foreground">No student profile — cannot enroll.</p>
        )}

        <div className="space-y-2">
          {user.enrollments.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{e.courseTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(e.enrolledAt), "MMM d, yyyy")} · {e.progress}% complete
                </p>
              </div>
              <Link href={`/courses/${e.courseSlug}`}>
                <Button size="sm" variant="ghost" className="rounded-xl">
                  View
                </Button>
              </Link>
            </div>
          ))}
          {user.studentId && user.enrollments.length === 0 && (
            <p className="text-sm text-muted-foreground">No enrollments yet.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Device Sessions</h2>
          {user.deviceSessions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={resetDevices}
            >
              Reset All Devices
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {user.deviceSessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2"
            >
              {s.deviceType === "MOBILE" ? (
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Monitor className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">{s.deviceType}</p>
                <p className="text-xs text-muted-foreground">
                  {s.ipAddress} · Last active{" "}
                  {format(new Date(s.lastActiveAt), "MMM d, HH:mm")}
                </p>
              </div>
            </div>
          ))}
          {user.deviceSessions.length === 0 && (
            <p className="text-sm text-muted-foreground">No active device sessions.</p>
          )}
        </div>
      </div>
    </div>
  )
}

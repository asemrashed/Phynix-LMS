"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format, startOfDay } from "date-fns"
import { AlertTriangle, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import type {
  AdminLiveSessionDetail,
  SessionType,
} from "@fxprime/types"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { SessionRegistrants } from "@/components/admin/session-registrants"
import { AdminCourseSelect } from "@/components/admin/admin-course-select"
import { cn } from "@/lib/utils"

const SESSION_TYPES: SessionType[] = [
  "PUBLIC_WEBINAR",
  "COURSE_CLASS",
  "QA_SESSION",
  "GROUP_MENTORSHIP",
]

const SESSION_TYPE_META: Record<
  SessionType,
  { label: string; description: string }
> = {
  PUBLIC_WEBINAR: {
    label: "Public webinar",
    description: "Free live webinar on /live — open to all registered users",
  },
  COURSE_CLASS: {
    label: "Course class",
    description: "For students enrolled in the linked course",
  },
  QA_SESSION: {
    label: "Q&A session",
    description: "Interactive Q&A — often PRO-only",
  },
  GROUP_MENTORSHIP: {
    label: "Group mentorship",
    description: "Small-group mentorship — typically PRO members only",
  },
}

const DURATION_PRESETS = [30, 60, 90, 120] as const

function statusBadgeClass(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-700"
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return ""
  }
}

type FieldErrors = {
  title?: string
  scheduledAt?: string
  courseId?: string
}

function validateSessionForm(
  title: string,
  scheduledAt: Date | undefined,
  type: SessionType,
  courseId: string,
  isPublic: boolean
): FieldErrors {
  const errors: FieldErrors = {}
  if (!title.trim()) errors.title = "Title is required"
  if (!scheduledAt) errors.scheduledAt = "Pick a date and time"
  if (type === "COURSE_CLASS" && !courseId) {
    errors.courseId = "Course class sessions must be linked to a course"
  } else if (!isPublic && !courseId) {
    errors.courseId = "Private sessions must be linked to a course"
  }
  return errors
}

function EditorCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("rounded-[20px] border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

function RequiredMark() {
  return <span className="text-destructive"> *</span>
}

interface SessionEditorProps {
  mode: "create" | "edit"
  initialSession?: AdminLiveSessionDetail
}

export function SessionEditor({ mode, initialSession }: SessionEditorProps) {
  const router = useRouter()
  const [session, setSession] = useState<AdminLiveSessionDetail | null>(
    initialSession ?? null
  )
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [leaveOpen, setLeaveOpen] = useState(false)

  const [title, setTitle] = useState(initialSession?.title ?? "")
  const [description, setDescription] = useState(initialSession?.description ?? "")
  const [meetingUrl, setMeetingUrl] = useState(initialSession?.meetingUrl ?? "")
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    initialSession ? new Date(initialSession.scheduledAt) : undefined
  )
  const [durationMinutes, setDurationMinutes] = useState(
    String(initialSession?.durationMinutes ?? 90)
  )
  const [capacity, setCapacity] = useState(String(initialSession?.capacity ?? 100))
  const [type, setType] = useState<SessionType>(
    (initialSession?.type as SessionType) ?? "PUBLIC_WEBINAR"
  )
  const [courseId, setCourseId] = useState(initialSession?.courseId ?? "")
  const [isPublic, setIsPublic] = useState(initialSession?.isPublic ?? true)
  const [requiresPremium, setRequiresPremium] = useState(
    initialSession?.requiresPremium ?? false
  )
  const [recordingUrl, setRecordingUrl] = useState(initialSession?.recordingUrl ?? "")

  const isCancelled = session?.status === "CANCELLED"
  const savedMeetingUrl = session?.meetingUrl ?? null
  const hasMeetingLink = !!savedMeetingUrl
  const courseRequired = type === "COURSE_CLASS" || !isPublic
  const scheduleMinDate = useMemo(() => startOfDay(new Date()), [])

  const baseline = useMemo(
    () => ({
      title: initialSession?.title ?? "",
      description: initialSession?.description ?? "",
      meetingUrl: initialSession?.meetingUrl ?? "",
      scheduledAt: initialSession?.scheduledAt ?? "",
      durationMinutes: String(initialSession?.durationMinutes ?? 90),
      capacity: String(initialSession?.capacity ?? 100),
      type: (initialSession?.type as SessionType) ?? "PUBLIC_WEBINAR",
      courseId: initialSession?.courseId ?? "",
      isPublic: initialSession?.isPublic ?? true,
      requiresPremium: initialSession?.requiresPremium ?? false,
      recordingUrl: initialSession?.recordingUrl ?? "",
    }),
    [initialSession]
  )

  const isDirty = useMemo(() => {
    return (
      title !== baseline.title ||
      description !== baseline.description ||
      meetingUrl !== baseline.meetingUrl ||
      (scheduledAt?.toISOString() ?? "") !==
        (baseline.scheduledAt ? new Date(baseline.scheduledAt).toISOString() : "") ||
      durationMinutes !== baseline.durationMinutes ||
      capacity !== baseline.capacity ||
      type !== baseline.type ||
      courseId !== baseline.courseId ||
      isPublic !== baseline.isPublic ||
      requiresPremium !== baseline.requiresPremium ||
      recordingUrl !== baseline.recordingUrl
    )
  }, [
    title,
    description,
    meetingUrl,
    scheduledAt,
    durationMinutes,
    capacity,
    type,
    courseId,
    isPublic,
    requiresPremium,
    recordingUrl,
    baseline,
  ])

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  const handleTypeChange = (nextType: SessionType) => {
    setType(nextType)
    setFieldErrors((prev) => ({ ...prev, courseId: undefined }))
    if (nextType === "COURSE_CLASS") {
      setIsPublic(false)
    } else if (nextType === "PUBLIC_WEBINAR") {
      setIsPublic(true)
      setRequiresPremium(false)
    } else if (nextType === "QA_SESSION" || nextType === "GROUP_MENTORSHIP") {
      setRequiresPremium(true)
    }
  }

  const applySessionUpdate = (updated: AdminLiveSessionDetail) => {
    setSession(updated)
    if (updated.meetingUrl) {
      setMeetingUrl(updated.meetingUrl)
    }
  }

  const copyMeetingLink = async () => {
    const link = savedMeetingUrl || meetingUrl
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Meeting link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  const save = useCallback(async () => {
    const errors = validateSessionForm(title, scheduledAt, type, courseId, isPublic)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error("Fix the highlighted fields before saving")
      return
    }

    if (!scheduledAt) return

    setSaving(true)
    try {
      const body = {
        title,
        description: description || undefined,
        meetingUrl: meetingUrl || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: Number(durationMinutes) || 90,
        capacity: Number(capacity) || 100,
        type,
        courseId: courseId || null,
        recordingUrl: recordingUrl || undefined,
        isPublic,
        requiresPremium,
      }

      if (mode === "create" || !session) {
        const created = await api<AdminLiveSessionDetail>("/admin/sessions", {
          method: "POST",
          body: JSON.stringify(body),
        })
        setSession(created)
        toast.success("Session created")
        if (created.meetingUrl) setMeetingUrl(created.meetingUrl)
        router.replace(`/admin/sessions/${created.id}`)
        return
      }

      const updated = await api<AdminLiveSessionDetail>(`/admin/sessions/${session.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      applySessionUpdate(updated)
      toast.success("Session saved")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save session"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }, [
    title,
    scheduledAt,
    type,
    courseId,
    isPublic,
    description,
    meetingUrl,
    durationMinutes,
    capacity,
    recordingUrl,
    requiresPremium,
    mode,
    session,
    router,
  ])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault()
        if (!isCancelled) void save()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [save, isCancelled])

  const cancelSession = async () => {
    if (!session) return
    setCancelling(true)
    try {
      const result = await api<{ cancelled: boolean; notified: number }>(
        `/admin/sessions/${session.id}/cancel`,
        { method: "POST" }
      )
      setSession((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev))
      toast.success(`Session cancelled · ${result.notified} registrant(s) notified`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to cancel session"
      toast.error(message)
    } finally {
      setCancelling(false)
    }
  }

  const handleBack = () => {
    if (isDirty) {
      setLeaveOpen(true)
      return
    }
    router.push("/admin/sessions")
  }

  const typeMeta = SESSION_TYPE_META[type]

  const saveButton = (
    <Button className="rounded-xl" disabled={saving || isCancelled} onClick={() => void save()}>
      {saving ? "Saving…" : mode === "create" ? "Create session" : "Save changes"}
    </Button>
  )

  const meetingLinkField = (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="meetingUrl">Meeting URL</Label>
        <Input
          id="meetingUrl"
          className="rounded-xl"
          placeholder="https://zoom.us/j/... or https://meet.google.com/..."
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          disabled={isCancelled}
        />
        <p className="text-xs text-muted-foreground">
          Paste the Zoom or Google Meet link. Students use Join on the live page to open it.
        </p>
      </div>
      {hasMeetingLink && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => void copyMeetingLink()}
          >
            <Copy className="mr-1.5 size-3.5" />
            Copy link
          </Button>
          <Button type="button" size="sm" variant="outline" className="rounded-xl" asChild>
            <a href={savedMeetingUrl!} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 size-3.5" />
              Open
            </a>
          </Button>
        </div>
      )}
    </div>
  )

  const scheduleFields = (
    <>
      <div className="space-y-2">
        <Label>
          Date & time
          <RequiredMark />
        </Label>
        <DateTimePicker
          value={scheduledAt}
          onChange={(date) => {
            setScheduledAt(date)
            if (fieldErrors.scheduledAt) {
              setFieldErrors((prev) => ({ ...prev, scheduledAt: undefined }))
            }
          }}
          fromDate={scheduleMinDate}
          disabled={isCancelled}
          invalid={!!fieldErrors.scheduledAt}
        />
        <FieldError message={fieldErrors.scheduledAt} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                size="sm"
                variant={Number(durationMinutes) === preset ? "default" : "outline"}
                className="rounded-xl"
                disabled={isCancelled}
                onClick={() => setDurationMinutes(String(preset))}
              >
                {preset}m
              </Button>
            ))}
          </div>
          <Input
            id="duration"
            type="number"
            min={15}
            className="rounded-xl"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            disabled={isCancelled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            className="rounded-xl"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            disabled={isCancelled}
          />
          <p className="text-xs text-muted-foreground">Max registrants</p>
        </div>
      </div>
    </>
  )

  const audienceFields = (
    <>
      <div className="space-y-2">
        <Label>Session type</Label>
        <Select
          value={type}
          onValueChange={(v) => handleTypeChange(v as SessionType)}
          disabled={isCancelled}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {SESSION_TYPE_META[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{typeMeta.description}</p>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="isPublic">Public on /live</Label>
          <p className="text-xs text-muted-foreground">
            Off = course students & registrants only
          </p>
        </div>
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => {
            setIsPublic(checked)
            if (fieldErrors.courseId) {
              setFieldErrors((prev) => ({ ...prev, courseId: undefined }))
            }
          }}
          disabled={isCancelled || type === "COURSE_CLASS"}
        />
      </div>
      {type === "COURSE_CLASS" && (
        <p className="text-xs text-muted-foreground">
          Course classes are always private to enrolled students.
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="requiresPremium">PRO members only</Label>
          <p className="text-xs text-muted-foreground">
            Requires an active PRO or Lifetime subscription to register
          </p>
        </div>
        <Switch
          id="requiresPremium"
          checked={requiresPremium}
          onCheckedChange={setRequiresPremium}
          disabled={isCancelled || type === "COURSE_CLASS"}
        />
      </div>
      {requiresPremium && (
        <p className="text-xs text-muted-foreground">
          Free users will see this session on /live with an upgrade prompt.
        </p>
      )}
      <div className="space-y-2">
        <Label>
          Link to course
          {courseRequired && <RequiredMark />}
        </Label>
        <AdminCourseSelect
          value={courseId}
          onChange={(id) => {
            setCourseId(id)
            if (fieldErrors.courseId) {
              setFieldErrors((prev) => ({ ...prev, courseId: undefined }))
            }
          }}
          label={session?.courseTitle ?? initialSession?.courseTitle ?? undefined}
          publishedOnly={false}
          placeholder="No course link"
          disabled={isCancelled}
          className={fieldErrors.courseId ? "border-destructive" : undefined}
        />
        <FieldError message={fieldErrors.courseId} />
        {courseId && !isCancelled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl text-muted-foreground"
            onClick={() => setCourseId("")}
          >
            Clear course link
          </Button>
        )}
      </div>
    </>
  )

  const overviewCard = (
    <EditorCard title="At a glance">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="text-right font-medium">{typeMeta.label}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Visibility</dt>
          <dd className="text-right font-medium">{isPublic ? "Public" : "Private"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Access</dt>
          <dd className="text-right font-medium">
            {requiresPremium ? "PRO members" : "Free webinar"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">When</dt>
          <dd className="text-right font-medium">
            {scheduledAt ? format(scheduledAt, "MMM d · h:mm a") : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="text-right font-medium">{durationMinutes || "90"} min</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Seats</dt>
          <dd className="text-right font-medium">{capacity || "100"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Meeting</dt>
          <dd className="text-right font-medium">
            {hasMeetingLink ? (
              <span className="text-green-700">Linked</span>
            ) : mode === "edit" && session?.status === "SCHEDULED" ? (
              <span className="text-amber-700">Missing</span>
            ) : (
              "—"
            )}
          </dd>
        </div>
        {mode === "edit" && session && (
          <>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Registered</dt>
              <dd className="text-right font-medium">{session.registrationCount}</dd>
            </div>
            {typeof session.attendedCount === "number" && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Attended</dt>
                <dd className="text-right font-medium">{session.attendedCount}</dd>
              </div>
            )}
          </>
        )}
      </dl>
    </EditorCard>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-28 lg:pb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/sessions">Live Sessions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {mode === "create" ? "New session" : "Edit session"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "create" ? "New Live Session" : title || "Edit Live Session"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Schedule a webinar or class. Students see it on /live after you save."
              : "Manage schedule, meeting link, audience, and registrants."}
          </p>
          {session && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className={cn(statusBadgeClass(session.status))}>
                {session.status}
              </Badge>
              {session.isPublic && <Badge variant="secondary">Public</Badge>}
              <Badge variant="secondary">{session.registrationCount} registered</Badge>
              {hasMeetingLink ? (
                <Badge className="border-green-200 bg-green-50 text-green-800 hover:bg-green-50">
                  Meeting linked
                </Badge>
              ) : mode === "edit" && session.status === "SCHEDULED" ? (
                <Badge variant="outline" className="border-amber-300 text-amber-800">
                  No meeting link
                </Badge>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handleBack}>
            Back
          </Button>
          {!isCancelled && saveButton}
          {session?.status === "SCHEDULED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl" disabled={cancelling}>
                  Cancel session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All {session.registrationCount} registered student(s) will be emailed and
                    notified in-app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Keep session</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl" onClick={cancelSession}>
                    Cancel & notify
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {mode === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <EditorCard title="Session details" description="Title and description shown to students.">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title
                  <RequiredMark />
                </Label>
                <Input
                  id="title"
                  className={cn("rounded-xl", fieldErrors.title && "border-destructive")}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (fieldErrors.title) {
                      setFieldErrors((prev) => ({ ...prev, title: undefined }))
                    }
                  }}
                  disabled={isCancelled}
                  aria-invalid={!!fieldErrors.title}
                />
                <FieldError message={fieldErrors.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="rounded-xl"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCancelled}
                  placeholder="What students will learn or discuss"
                />
              </div>
            </EditorCard>

            <EditorCard title="Schedule" description="When the session runs and how long it lasts.">
              {scheduleFields}
            </EditorCard>

            <EditorCard
              title="Meeting link"
              description="Paste the Zoom or Google Meet URL students will open when they join."
            >
              {meetingLinkField}
            </EditorCard>

            {!isCancelled && (
              <div className="hidden items-center justify-between gap-3 rounded-[20px] border bg-card px-5 py-4 shadow-sm lg:flex">
                <p className="text-sm text-muted-foreground">
                  {isDirty ? "Unsaved changes" : "All changes saved"} · Ctrl+S to save
                </p>
                {saveButton}
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <EditorCard title="Audience" description="Who can see and register.">
              {audienceFields}
            </EditorCard>
            {overviewCard}
            <EditorCard title="Recording" description="Add after the session ends.">
              <div className="space-y-2">
                <Label htmlFor="recordingUrl">Recording URL</Label>
                <Input
                  id="recordingUrl"
                  className="rounded-xl"
                  placeholder="https://... session recording link"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  disabled={isCancelled}
                />
                <p className="text-xs text-muted-foreground">
                  Visible to registered students on /live
                </p>
              </div>
            </EditorCard>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <EditorCard title="Basics">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title
                  <RequiredMark />
                </Label>
                <Input
                  id="title"
                  className={cn("rounded-xl", fieldErrors.title && "border-destructive")}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (fieldErrors.title) {
                      setFieldErrors((prev) => ({ ...prev, title: undefined }))
                    }
                  }}
                  aria-invalid={!!fieldErrors.title}
                />
                <FieldError message={fieldErrors.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="rounded-xl"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What students will learn or discuss"
                />
              </div>
            </EditorCard>
            <EditorCard title="Schedule">{scheduleFields}</EditorCard>
          </div>
          <div className="space-y-4">
            <EditorCard title="Audience">{audienceFields}</EditorCard>
            <EditorCard title="Meeting link">{meetingLinkField}</EditorCard>
            {overviewCard}
          </div>
        </div>
      )}

      {mode === "create" && !isCancelled && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            You’ll be taken to the session page to manage registrants after creating.
          </p>
          {saveButton}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={handleBack}>
            Back
          </Button>
          {!isCancelled && (
            <Button
              className="flex-1 rounded-xl"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>

      {mode === "edit" && session && (
        <SessionRegistrants
          sessionId={session.id}
          sessionStatus={session.status}
          onAttendanceChange={(attendedCount) =>
            setSession((prev) => (prev ? { ...prev, attendedCount } : prev))
          }
          onRegistrationChange={(registrationCount) =>
            setSession((prev) => (prev ? { ...prev, registrationCount } : prev))
          }
        />
      )}

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits. Leaving now will lose them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={() => router.push("/admin/sessions")}
            >
              Discard & leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

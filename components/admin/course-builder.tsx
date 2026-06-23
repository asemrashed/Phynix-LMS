"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { uploadThumbnail } from "@/lib/upload"
import { getMediaUrl } from "@/lib/media-url"
import { stripHtml, toRichTextHtml } from "@/lib/strip-html"
import type { AdminCourseDetail, AdminInstructorItem, CourseFaqItem, CourseLevel } from "@fxprime/types"
import { createCourseSchema, updateCourseSchema } from "@/lib/schemas/admin-course"
import { getApiErrorMessage } from "@/lib/api-errors"
import {
  CourseCurriculumBuilder,
  getCurriculumPublishIssues,
} from "@/components/admin/course-curriculum-builder"
import { CourseAdminInsights } from "@/components/admin/course-admin-insights"
import { ReorderableStringList } from "@/components/admin/reorderable-string-list"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react"

interface CourseBuilderProps {
  initialCourse?: AdminCourseDetail
  instructors: AdminInstructorItem[]
  mode: "create" | "edit"
}

const LEVELS: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
const COURSE_LANGUAGE = "ENGLISH"
const COURSE_CURRENCY = "BDT"

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function parseOptionalDate(iso: string | null | undefined) {
  if (!iso) return undefined
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function CourseBuilder({ initialCourse, instructors, mode }: CourseBuilderProps) {
  const router = useRouter()
  const params = useParams()
  const urlSlug = params.slug as string | undefined
  const [course, setCourse] = useState<AdminCourseDetail | null>(initialCourse ?? null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [publishIssuesOpen, setPublishIssuesOpen] = useState(false)
  const [publishIssues, setPublishIssues] = useState<string[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const markDirty = () => setIsDirty(true)

  const [title, setTitle] = useState(initialCourse?.title ?? "")
  const [slug, setSlug] = useState(initialCourse?.slug ?? "")
  const [description, setDescription] = useState(
    toRichTextHtml(initialCourse?.description ?? "")
  )
  const [thumbnailUrl, setThumbnailUrl] = useState(initialCourse?.thumbnailUrl ?? "")
  const [price, setPrice] = useState(String(initialCourse?.price ?? 0))
  const [originalPrice, setOriginalPrice] = useState(
    initialCourse?.originalPrice != null ? String(initialCourse.originalPrice) : ""
  )
  const [level, setLevel] = useState<CourseLevel>(initialCourse?.level ?? "BEGINNER")
  const [instructorId, setInstructorId] = useState(
    initialCourse?.instructorId ?? instructors[0]?.id ?? ""
  )
  const [isFeatured, setIsFeatured] = useState(initialCourse?.isFeatured ?? false)
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(
    initialCourse?.learningOutcomes?.length ? initialCourse.learningOutcomes : [""]
  )
  const [subtitle, setSubtitle] = useState(initialCourse?.subtitle ?? "")
  const [badgeLabel, setBadgeLabel] = useState(initialCourse?.badgeLabel ?? "")
  const [highlights, setHighlights] = useState<string[]>(
    initialCourse?.highlights?.length ? initialCourse.highlights : [""]
  )
  const [faqs, setFaqs] = useState<CourseFaqItem[]>(
    initialCourse?.faqs?.length ? initialCourse.faqs : [{ question: "", answer: "" }]
  )
  const [discountEndsAt, setDiscountEndsAt] = useState<Date | undefined>(() =>
    parseOptionalDate(initialCourse?.discountEndsAt)
  )
  const [seatLimit, setSeatLimit] = useState(
    initialCourse?.seatLimit != null ? String(initialCourse.seatLimit) : ""
  )
  const [startsAt, setStartsAt] = useState<Date | undefined>(() =>
    parseOptionalDate(initialCourse?.startsAt)
  )
  const [classSchedule, setClassSchedule] = useState(initialCourse?.classSchedule ?? "")
  const [deliveryType, setDeliveryType] = useState(initialCourse?.deliveryType ?? "")
  const [refundDays, setRefundDays] = useState(
    initialCourse?.refundDays != null ? String(initialCourse.refundDays) : ""
  )

  const normalizeOutcomes = (items: string[]) =>
    items.map((item) => item.trim()).filter(Boolean)

  const normalizeHighlights = (items: string[]) =>
    items.map((item) => item.trim()).filter(Boolean)

  const normalizeFaqs = (items: CourseFaqItem[]) =>
    items
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer)

  const addOutcome = () => {
    markDirty()
    setLearningOutcomes((prev) => (prev.length >= 20 ? prev : [...prev, ""]))
  }

  const removeOutcome = (index: number) => {
    markDirty()
    setLearningOutcomes((prev) => {
      if (prev.length <= 1) return [""]
      return prev.filter((_, i) => i !== index)
    })
  }

  const addHighlight = () => {
    markDirty()
    setHighlights((prev) => (prev.length >= 12 ? prev : [...prev, ""]))
  }

  const removeHighlight = (index: number) => {
    markDirty()
    setHighlights((prev) => {
      if (prev.length <= 1) return [""]
      return prev.filter((_, i) => i !== index)
    })
  }

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return
    setActiveTab(tab)
  }

  const updateFaq = (index: number, field: keyof CourseFaqItem, value: string) => {
    markDirty()
    setFaqs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const addFaq = () => {
    markDirty()
    setFaqs((prev) => (prev.length >= 20 ? prev : [...prev, { question: "", answer: "" }]))
  }

  const removeFaq = (index: number) => {
    markDirty()
    setFaqs((prev) => {
      if (prev.length <= 1) return [{ question: "", answer: "" }]
      return prev.filter((_, i) => i !== index)
    })
  }

  const syncMarketingFromCourse = (courseData: AdminCourseDetail) => {
    setSubtitle(courseData.subtitle ?? "")
    setBadgeLabel(courseData.badgeLabel ?? "")
    setHighlights(courseData.highlights.length > 0 ? courseData.highlights : [""])
    setFaqs(courseData.faqs.length > 0 ? courseData.faqs : [{ question: "", answer: "" }])
    setDiscountEndsAt(parseOptionalDate(courseData.discountEndsAt))
    setSeatLimit(courseData.seatLimit != null ? String(courseData.seatLimit) : "")
    setStartsAt(parseOptionalDate(courseData.startsAt))
    setClassSchedule(courseData.classSchedule ?? "")
    setDeliveryType(courseData.deliveryType ?? "")
    setRefundDays(courseData.refundDays != null ? String(courseData.refundDays) : "")
  }

  const saveMetadata = useCallback(async () => {
    setSaving(true)
    try {
      const body = {
        title,
        slug: slug || slugify(title),
        description,
        subtitle: subtitle.trim() || undefined,
        badgeLabel: badgeLabel.trim() || undefined,
        highlights: normalizeHighlights(highlights),
        faqs: normalizeFaqs(faqs),
        discountEndsAt: discountEndsAt?.toISOString(),
        seatLimit: seatLimit ? Number(seatLimit) : undefined,
        startsAt: startsAt?.toISOString(),
        classSchedule: classSchedule.trim() || undefined,
        deliveryType: deliveryType.trim() || undefined,
        refundDays: refundDays ? Number(refundDays) : undefined,
        learningOutcomes: normalizeOutcomes(learningOutcomes),
        thumbnailUrl: thumbnailUrl || undefined,
        price: Number(price) || 0,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        currency: COURSE_CURRENCY,
        level,
        language: COURSE_LANGUAGE,
        instructorId,
        isFeatured,
      }

      if (stripHtml(description).length < 10) {
        toast.error("Description must be at least 10 characters")
        return null
      }

      const parsed =
        mode === "create" || !course
          ? createCourseSchema.safeParse(body)
          : updateCourseSchema.safeParse(body)

      if (!parsed.success) {
        toast.error(parsed.error.errors[0]?.message ?? "Invalid course data")
        return null
      }

      if (mode === "create" || !course) {
        const created = await api<AdminCourseDetail>("/admin/courses", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        })
        setCourse(created)
        setLearningOutcomes(
          created.learningOutcomes.length > 0 ? created.learningOutcomes : [""]
        )
        syncMarketingFromCourse(created)
        setIsDirty(false)
        toast.success("Course created as draft")
        router.replace(`/admin/course/${created.slug}`)
        setActiveTab("curriculum")
        return created
      }

      const updated = await api<AdminCourseDetail>(`/admin/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify(parsed.data),
      })
      setCourse(updated)
      setSlug(updated.slug)
      setLearningOutcomes(
        updated.learningOutcomes.length > 0 ? updated.learningOutcomes : [""]
      )
      syncMarketingFromCourse(updated)
      if (mode === "edit" && urlSlug && updated.slug !== urlSlug) {
        router.replace(`/admin/course/${updated.slug}`)
      }
      setIsDirty(false)
      toast.success("Course saved")
      return updated
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save course"))
      return null
    } finally {
      setSaving(false)
    }
  }, [
    badgeLabel,
    classSchedule,
    course,
    deliveryType,
    description,
    discountEndsAt,
    faqs,
    highlights,
    instructorId,
    isFeatured,
    learningOutcomes,
    level,
    mode,
    originalPrice,
    price,
    refundDays,
    router,
    seatLimit,
    slug,
    startsAt,
    subtitle,
    thumbnailUrl,
    title,
    urlSlug,
  ])

  const publishCourse = async (force = false) => {
    let current = course
    if (!current) {
      const saved = await saveMetadata()
      if (!saved) return
      current = saved
    } else if (isDirty) {
      const saved = await saveMetadata()
      if (!saved) return
      current = saved
    }

    const issues = getCurriculumPublishIssues({
      ...current,
      title,
      slug: slug || slugify(title),
      description,
      thumbnailUrl: thumbnailUrl || null,
    })

    if (issues.length > 0 && !force) {
      setPublishIssues(issues)
      setPublishIssuesOpen(true)
      return
    }

    try {
      const updated = await api<AdminCourseDetail>(`/admin/courses/${current!.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PUBLISHED" }),
      })
      setCourse(updated)
      toast.success("Course published")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to publish course"))
    }
  }

  const updateStatus = async (status: "DRAFT" | "ARCHIVED") => {
    if (!course) return
    try {
      const updated = await api<AdminCourseDetail>(`/admin/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      setCourse(updated)
      toast.success(`Course ${status.toLowerCase()}`)
    } catch {
      toast.error("Failed to update status")
    }
  }

  const deleteCourse = async () => {
    if (!course) return
    setDeleting(true)
    try {
      await api(`/admin/courses/${course.id}`, { method: "DELETE" })
      toast.success("Course deleted")
      router.push("/admin/courses")
    } catch {
      toast.error("Failed to delete course")
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadThumbnail(file)
      setThumbnailUrl(result.path ?? result.url)
      markDirty()
      toast.success("Thumbnail uploaded")
    } catch {
      toast.error("Failed to upload thumbnail")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-8">
      <Button variant="ghost" className="rounded-xl" asChild>
        <Link href="/admin/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to courses
        </Link>
      </Button>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-6">
        <div className="rounded-[20px] border bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "create" ? "New Course" : title || "Edit Course"}
              </h1>
              {course && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{course.status}</Badge>
                  <span className="text-sm text-muted-foreground">/{course.slug}</span>
                  {course.enrollmentCount > 0 && (
                    <Badge variant="secondary">{course.enrollmentCount} enrolled</Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {course && (
                <Button variant="outline" className="rounded-xl" asChild>
                  <a
                    href={`/courses/${course.slug}?preview=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview
                  </a>
                </Button>
              )}
              <Button className="rounded-xl" onClick={() => void saveMetadata()} disabled={saving}>
                {saving ? "Saving…" : isDirty ? "Save changes" : "Save"}
              </Button>
              {course?.status !== "PUBLISHED" && (
                <Button
                  className="rounded-xl"
                  variant="secondary"
                  onClick={() => void publishCourse()}
                >
                  Publish
                </Button>
              )}
              {course?.status === "PUBLISHED" && (
                <>
                  <Button variant="outline" className="rounded-xl" onClick={() => void updateStatus("DRAFT")}>
                    Unpublish
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => void updateStatus("ARCHIVED")}>
                    Archive
                  </Button>
                </>
              )}
              {course && (
                <Button
                  variant="outline"
                  className="rounded-xl text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          <TabsList className="mt-4 h-10 rounded-xl border bg-white p-1">
            <TabsTrigger value="details" className="rounded-lg px-4 data-[state=active]:bg-muted">
              Details
            </TabsTrigger>
            <TabsTrigger value="marketing" className="rounded-lg px-4 data-[state=active]:bg-muted">
              Marketing
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="rounded-lg px-4 data-[state=active]:bg-muted"
              disabled={!course}
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-lg px-4 data-[state=active]:bg-muted"
              disabled={!course}
            >
              Students
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-4 data-[state=active]:bg-muted">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Course information</h2>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  className="rounded-xl"
                  value={title}
                  onChange={(e) => {
                    markDirty()
                    const nextTitle = e.target.value
                    setTitle(nextTitle)
                    if (mode === "create") setSlug(slugify(nextTitle))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  className={`rounded-xl ${mode === "create" ? "bg-muted text-muted-foreground" : ""}`}
                  value={slug}
                  readOnly={mode === "create"}
                  onChange={(e) => {
                    if (mode === "create") return
                    markDirty()
                    setSlug(e.target.value)
                  }}
                />
                {mode === "create" && (
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from the course title.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={description}
                  onChange={(html) => {
                    markDirty()
                    setDescription(html)
                  }}
                  placeholder="What students will learn in this course"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (BDT)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  className="rounded-xl"
                  value={price}
                  onChange={(e) => {
                    markDirty()
                    setPrice(e.target.value)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original price (optional)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min={0}
                  className="rounded-xl"
                  value={originalPrice}
                  onChange={(e) => {
                    markDirty()
                    setOriginalPrice(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Thumbnail</h2>
              {thumbnailUrl && (
                <img
                  src={getMediaUrl(thumbnailUrl) ?? thumbnailUrl}
                  alt="Course thumbnail"
                  className="aspect-video w-full rounded-xl object-cover"
                />
              )}
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Image URL</Label>
                <Input
                  id="thumbnailUrl"
                  className="rounded-xl"
                  value={thumbnailUrl}
                  onChange={(e) => {
                    markDirty()
                    setThumbnailUrl(e.target.value)
                  }}
                  placeholder="https://… or upload below"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnailFile">Upload image</Label>
                <Input
                  id="thumbnailFile"
                  type="file"
                  accept="image/*"
                  className="rounded-xl"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleThumbnailUpload(file)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">What students will learn</h2>
                <p className="text-sm text-muted-foreground">
                  Bullet points shown on the public course page. Leave empty to use default outcomes.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={addOutcome}
                disabled={learningOutcomes.length >= 20}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add outcome
              </Button>
            </div>
            <ReorderableStringList
              items={learningOutcomes}
              onChange={(items) => {
                markDirty()
                setLearningOutcomes(items)
              }}
              onRemove={removeOutcome}
              placeholder="e.g. Understand the IELTS exam format and scoring"
            />
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="subtitle">Hero subtitle</Label>
                <Textarea
                  id="subtitle"
                  className="min-h-[80px] rounded-xl"
                  value={subtitle}
                  onChange={(e) => {
                    markDirty()
                    setSubtitle(e.target.value)
                  }}
                  placeholder="Short tagline shown under the course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badgeLabel">Badge label</Label>
                <Input
                  id="badgeLabel"
                  className="rounded-xl"
                  value={badgeLabel}
                  onChange={(e) => {
                    markDirty()
                    setBadgeLabel(e.target.value)
                  }}
                  placeholder="e.g. Live Course, Self-paced"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryType">Delivery type</Label>
                <Input
                  id="deliveryType"
                  className="rounded-xl"
                  value={deliveryType}
                  onChange={(e) => {
                    markDirty()
                    setDeliveryType(e.target.value)
                  }}
                  placeholder="e.g. Live Online, Recorded"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classSchedule">Class schedule</Label>
                <Input
                  id="classSchedule"
                  className="rounded-xl"
                  value={classSchedule}
                  onChange={(e) => {
                    markDirty()
                    setClassSchedule(e.target.value)
                  }}
                  placeholder="e.g. 9:00 PM - 10:30 PM"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Pricing & urgency</h2>
              <div className="space-y-2">
                <Label htmlFor="discountEndsAt">Discount ends at</Label>
                <DateTimePicker
                  id="discountEndsAt"
                  value={discountEndsAt}
                  onChange={(date) => {
                    markDirty()
                    setDiscountEndsAt(date)
                  }}
                  placeholder="No discount deadline"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startsAt">Course starts at</Label>
                <DateTimePicker
                  id="startsAt"
                  value={startsAt}
                  onChange={(date) => {
                    markDirty()
                    setStartsAt(date)
                  }}
                  placeholder="No start date"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seatLimit">Seat limit</Label>
                  <Input
                    id="seatLimit"
                    type="number"
                    min={1}
                    className="rounded-xl"
                    value={seatLimit}
                    onChange={(e) => {
                      markDirty()
                      setSeatLimit(e.target.value)
                    }}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundDays">Refund window (days)</Label>
                  <Input
                    id="refundDays"
                    type="number"
                    min={0}
                    max={90}
                    className="rounded-xl"
                    value={refundDays}
                    onChange={(e) => {
                      markDirty()
                      setRefundDays(e.target.value)
                    }}
                    placeholder="e.g. 7"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Overview highlights</h2>
                <p className="text-sm text-muted-foreground">
                  Bullet points on the course overview and sidebar. Leave empty to auto-generate from curriculum.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={addHighlight}
                disabled={highlights.length >= 12}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add highlight
              </Button>
            </div>
            <ReorderableStringList
              items={highlights}
              onChange={(items) => {
                markDirty()
                setHighlights(items)
              }}
              onRemove={removeHighlight}
              placeholder="e.g. Lifetime access"
            />
          </div>

          <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">FAQs</h2>
                <p className="text-sm text-muted-foreground">
                  Shown on the public course page. Leave empty to hide the FAQ section.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={addFaq}
                disabled={faqs.length >= 20}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add FAQ
              </Button>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2 rounded-xl border p-4">
                  <Input
                    className="rounded-xl"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    placeholder="Question"
                  />
                  <Textarea
                    className="min-h-[80px] rounded-xl"
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    placeholder="Answer"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-muted-foreground hover:text-destructive"
                    onClick={() => removeFaq(index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove FAQ
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="mt-0">
          {course ? (
            <CourseCurriculumBuilder course={course} onCourseChange={setCourse} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Save course details first to build the curriculum.
            </p>
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          {course ? (
            <CourseAdminInsights
              courseId={course.id}
              enrollmentCount={course.enrollmentCount}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Save the course first to view enrollments and reviews.
            </p>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-0 space-y-6">
          <div className="space-y-4 rounded-[20px] border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Course settings</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={level}
                  onValueChange={(v) => {
                    markDirty()
                    setLevel(v as CourseLevel)
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l.charAt(0) + l.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Select
                  value={instructorId}
                  onValueChange={(v) => {
                    markDirty()
                    setInstructorId(v)
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {instructors.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Instructor bio and photo are updated by the instructor in their panel settings.
            </p>
            <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <Switch
                checked={isFeatured}
                onCheckedChange={(checked) => {
                  markDirty()
                  setIsFeatured(checked)
                }}
              />
              <div>
                <Label>Featured course</Label>
                <p className="text-xs text-muted-foreground">Show on homepage highlights</p>
              </div>
            </div>
          </div>

          {course && (
            <div className="space-y-3 rounded-[20px] border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Related admin</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/admin/payments/installments"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Installment plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/sessions"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Live sessions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/certificates"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/users"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Users (manual enrollment)
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {mode === "create" && !course && (
        <p className="text-sm text-muted-foreground">
          Fill in course details and click Save to unlock the Curriculum tab.
        </p>
      )}

      <AlertDialog open={publishIssuesOpen} onOpenChange={setPublishIssuesOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete before publishing?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 pt-1">
                <p>These items are recommended before going live:</p>
                <ul className="list-inside list-disc text-sm">
                  {publishIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Go fix</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={() => {
                setPublishIssuesOpen(false)
                void publishCourse(true)
              }}
            >
              Publish anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the course, its sections, lessons, and enrollments.
              {course && course.enrollmentCount > 0 && (
                <span className="mt-2 block font-medium text-destructive">
                  Warning: {course.enrollmentCount} student
                  {course.enrollmentCount === 1 ? "" : "s"} currently enrolled.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void deleteCourse()
              }}
            >
              {deleting ? "Deleting…" : "Delete course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { AppImage } from "@/components/ui/app-image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Users,
  Clock,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Lock,
  FileText,
  HelpCircle,
} from "lucide-react"
import type { CourseDetail, LessonItem } from "@fxprime/types"
import { api, ApiError } from "@/lib/api"
import { handleVerificationError } from "@/lib/verification"
import { useAuth } from "@/lib/auth-context"
import { getSettingsPath } from "@/lib/get-default-panel"
import { CourseReviewsSection } from "@/components/course-reviews-section"
import { CourseLessonPreview } from "@/components/course/course-lesson-preview"
import { CourseSidebarWidget } from "@/components/course/course-sidebar-widget"
import { CourseDetailExtras } from "@/components/course/course-detail-extras"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/media-url"
import { toast } from "sonner"
import { SaveButton } from "@/components/save-button"
import { formatCourseDuration, sumLessonDuration } from "@/lib/format-duration"
import { resolveCourseOutcomes } from "@/lib/course-defaults"
import { resolveCourseHighlights } from "@/lib/course-highlights"
import { AnimatePresence, motion } from "framer-motion"

function LessonTypeIcon({
  type,
  completed,
}: {
  type: LessonItem["type"]
  completed?: boolean
}) {
  if (completed) return <CheckCircle2 className="h-4 w-4 text-primary" />
  const icons = {
    VIDEO: Play,
    TEXT: FileText,
    QUIZ: HelpCircle,
  }
  const Icon = icons[type] || Play
  return <Icon className="h-4 w-4 text-muted-foreground" />
}

import { formatPrice } from "@/lib/money"

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewMode = searchParams.get("preview") === "1"
  const { user, refreshUser } = useAuth()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null)
  const [showAllModules, setShowAllModules] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [activeSection, setActiveSection] = useState<string>("overview")

  useEffect(() => {
    async function fetchCourse() {
      try {
        const query = previewMode ? "?preview=1" : ""
        const data = await api<CourseDetail>(`/courses/${slug}${query}`)
        setCourse(data)
        const expanded: Record<string, boolean> = {}
        data.sections.forEach((section, index) => {
          expanded[section.id] = index === 0
        })
        setExpandedSections(expanded)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [slug, previewMode])

  const showInstructorSection = useMemo(() => {
    if (!course) return false
    return !!(
      course.instructorBio ||
      course.instructorPhotoUrl ||
      course.instructorTitle ||
      course.instructorStats
    )
  }, [course])

  const tabs = useMemo(() => {
    if (!course) return []
    return [
      { id: "overview", label: "Overview" },
      { id: "curriculum", label: "Curriculum" },
      ...(showInstructorSection ? [{ id: "instructor", label: "Instructor" }] : []),
      { id: "reviews", label: "Reviews" },
      ...(course.faqs.length > 0 ? [{ id: "faqs", label: "FAQs" }] : []),
    ]
  }, [course, showInstructorSection])

  useEffect(() => {
    if (!course) return

    const sections = tabs.map((tab) => tab.id)
    const handleScroll = () => {
      const offset = 140
      let currentSection = "overview"

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= offset) {
            currentSection = sectionId
          }
        }
      }
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [course, tabs])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 130
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${slug}`)
      return
    }
    if (!course) return

    if (course.price > 0 && !course.isEnrolled) {
      router.push(`/checkout?courseId=${course.id}`)
      return
    }

    setEnrolling(true)
    try {
      await api(`/courses/${course.id}/enroll`, { method: "POST" })
      await refreshUser()
      toast.success("Enrolled successfully!")
      const updated = await api<CourseDetail>(`/courses/${slug}`)
      setCourse(updated)
    } catch (err) {
      if (
        handleVerificationError(err, () => {
          toast.error("Verify your email before enrolling")
          router.push(getSettingsPath(user?.role))
        })
      ) {
        return
      }
      if (err instanceof ApiError && err.code === "PAYMENT_REQUIRED") {
        router.push(`/checkout?courseId=${course.id}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : "Enrollment failed")
      }
    } finally {
      setEnrolling(false)
    }
  }

  const handleLessonClick = (lesson: LessonItem) => {
    if (course?.isEnrolled) {
      router.push(`/dashboard/courses/${course.slug}?lesson=${lesson.id}`)
      return
    }
    if (lesson.isFree && lesson.type === "VIDEO") {
      setPreviewLesson(lesson)
    }
  }

  const totalLessons = useMemo(
    () => course?.sections.reduce((sum, section) => sum + section.lessons.length, 0) ?? 0,
    [course]
  )

  const computedDuration = useMemo(
    () => (course ? sumLessonDuration(course.sections) : 0),
    [course]
  )

  const displayDuration = course
    ? formatCourseDuration(Math.max(course.totalDuration, computedDuration))
    : "—"

  const freePreviewCount = useMemo(
    () =>
      course?.sections
        .flatMap((section) => section.lessons)
        .filter((lesson) => lesson.isFree).length ?? 0,
    [course]
  )

  const outcomes = useMemo(() => {
    if (!course) return []
    return resolveCourseOutcomes(course.language, course.learningOutcomes)
  }, [course])

  const highlights = useMemo(() => {
    if (!course) return []
    return resolveCourseHighlights(course, totalLessons, displayDuration, freePreviewCount)
  }, [course, totalLessons, displayDuration, freePreviewCount])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="mt-4 h-64 rounded-[20px] bg-muted" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Link href="/courses">
          <Button variant="outline" className="mt-4 rounded-xl">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>
    )
  }

  const visibleSections = showAllModules ? course.sections : course.sections.slice(0, 3)
  const hiddenSectionsCount = course.sections.length - 3

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/courses" className="hover:text-foreground">
          Courses
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{course.title}</span>
      </nav>

      {course.status !== "PUBLISHED" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Draft preview — this course is not public yet ({course.status.toLowerCase()}).
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="block space-y-3 lg:hidden">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-900 shadow-sm">
              <AppImage
                src={
                  getMediaUrl(course.thumbnailUrl) ||
                  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop"
                }
                alt={course.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
            {freePreviewCount > 0 && !course.isEnrolled && (
              <p className="px-1 text-xs font-semibold text-neutral-400">
                {freePreviewCount} free preview lesson{freePreviewCount > 1 ? "s" : ""} available —
                enroll to unlock the full course.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-secondary via-[#3d2f0f] to-[#1a1610] p-6 text-white shadow-[0_12px_40px_rgba(251,217,66,0.2)] md:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              {course.badgeLabel && (
                <span className="inline-block rounded-md bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                  {course.badgeLabel}
                </span>
              )}
              <SaveButton
                entityType="COURSE"
                entityId={course.id}
                mode="bookmark"
                size="sm"
                showLabel
              />
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl lg:text-4xl">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="mt-3 text-sm font-medium leading-relaxed text-primary/80 md:text-base">
                {course.subtitle}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-primary/30 pt-5 text-sm font-semibold text-primary/90">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {course.averageRating > 0 && course.reviewCount ? (
                  <>
                    <span className="font-bold text-primary">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-primary/70">({course.reviewCount} reviews)</span>
                  </>
                ) : (
                  <span className="text-primary/70">No ratings yet</span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>{course.enrollmentCount} students enrolled</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{displayDuration} content</span>
              </span>
            </div>
          </div>

          <div className="sticky top-16 z-30 -mx-4 border-b border-neutral-200/60 bg-white/95 px-4 py-1.5 backdrop-blur-md transition-all duration-200 sm:mx-0 sm:px-0">
            <div className="flex gap-6 overflow-x-auto py-2 [scrollbar-width:none] md:gap-8 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((tab) => {
                const isActive = activeSection === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={cn(
                      "relative whitespace-nowrap pb-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none",
                      isActive
                        ? "font-bold text-primary"
                        : "font-medium text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 animate-in rounded-full bg-primary fade-in zoom-in-95 duration-200" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            id="overview"
            className="scroll-mt-32 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:p-8"
          >
            <h2 className="mb-4 border-b border-neutral-100 pb-3 text-lg font-bold text-slate-900">
              Course Overview
            </h2>
            <div
              className="prose prose-neutral mb-6 max-w-none text-sm leading-relaxed text-neutral-600 md:text-base [&_a]:text-primary"
              dangerouslySetInnerHTML={{
                __html: /<[a-z][\s\S]*>/i.test(course.description)
                  ? course.description
                  : `<p>${course.description.replace(/\n/g, "<br>")}</p>`,
              }}
            />

            {highlights.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-semibold text-neutral-700"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {course.isEnrolled && (
            <div className="rounded-2xl border border-neutral-100 bg-card p-6 shadow-sm">
              <div className="mb-2.5 flex justify-between text-sm font-bold text-slate-800">
                <span>Your Learning Progress</span>
                <span className="text-primary">{course.progress}%</span>
              </div>
              <Progress
                value={course.progress}
                className="h-2 bg-neutral-100 [&>div]:bg-primary"
              />
            </div>
          )}

          {outcomes.length > 0 && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:p-8">
              <h2 className="mb-4 border-b border-neutral-100 pb-3 text-lg font-bold text-slate-900">
                What you&apos;ll learn
              </h2>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {outcomes.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 text-sm font-semibold leading-relaxed text-neutral-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            id="curriculum"
            className="scroll-mt-32 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:p-8"
          >
            <h2 className="mb-4 border-b border-neutral-100 pb-3 text-lg font-bold text-slate-900">
              Course Curriculum
            </h2>
            <div className="space-y-3.5">
              {visibleSections.map((section, index) => {
                const sectionLessonsCount = section.lessons.length
                const completedLessons = section.lessons.filter((lesson) => lesson.isCompleted).length
                const progressVal =
                  sectionLessonsCount > 0
                    ? Math.round((completedLessons / sectionLessonsCount) * 100)
                    : 0
                const isSectionExpanded = expandedSections[section.id]

                return (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-xl border border-neutral-100 bg-white"
                  >
                    <button
                      className="flex w-full flex-col p-4 text-left transition-colors hover:bg-neutral-50/30"
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [section.id]: !prev[section.id],
                        }))
                      }
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 md:text-base">
                          Module {index + 1}: {section.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 md:text-sm">
                          <span>{sectionLessonsCount} lessons</span>
                          {isSectionExpanded ? (
                            <ChevronUp className="h-4 w-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                      </div>

                      {course.isEnrolled && (
                        <div className="mt-3.5 w-full">
                          <Progress
                            value={progressVal}
                            className="h-1.5 bg-neutral-100 [&>div]:bg-primary"
                          />
                          <span className="mt-1 block text-[10px] font-bold text-neutral-400">
                            {progressVal}% completed
                          </span>
                        </div>
                      )}
                    </button>

                    {isSectionExpanded && (
                      <div className="border-t border-neutral-100 bg-neutral-50/20 px-4 pb-3">
                        {section.lessons.map((lesson) => {
                          const canPreview =
                            !course.isEnrolled && lesson.isFree && lesson.type === "VIDEO"
                          const isActivePreview = previewLesson?.id === lesson.id
                          const isLocked = !course.isEnrolled && !lesson.isFree

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => handleLessonClick(lesson)}
                              disabled={isLocked}
                              className={cn(
                                "flex w-full items-center justify-between border-b border-neutral-100/70 py-3.5 text-left text-xs font-semibold last:border-0 md:text-sm",
                                (canPreview || course.isEnrolled) &&
                                  "cursor-pointer transition-colors hover:bg-white/80",
                                isActivePreview && "bg-primary/10 text-amber-900",
                                isLocked && "cursor-not-allowed opacity-60"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <LessonTypeIcon
                                  type={lesson.type}
                                  completed={lesson.isCompleted}
                                />
                                <span className="text-neutral-700">{lesson.title}</span>
                                {lesson.isFree && !course.isEnrolled && (
                                  <Badge
                                    variant="outline"
                                    className="border-primary/30 bg-primary/10 px-1.5 py-0 text-[10px] font-bold text-primary"
                                  >
                                    Preview
                                  </Badge>
                                )}
                                {isLocked && <Lock className="h-3.5 w-3.5 text-neutral-400" />}
                              </div>
                              <span className="text-xs text-neutral-400">
                                {lesson.duration > 0
                                  ? `${Math.round(lesson.duration / 60)}m`
                                  : lesson.type}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {hiddenSectionsCount > 0 && !showAllModules && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  className="rounded-xl border-neutral-200 px-5 font-bold text-neutral-600 hover:bg-neutral-50"
                  onClick={() => setShowAllModules(true)}
                >
                  + {hiddenSectionsCount} more modules
                </Button>
              </div>
            )}
          </div>

          {showInstructorSection && (
            <div
              id="instructor"
              className="scroll-mt-32 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:p-8"
            >
              <h2 className="mb-5 border-b border-neutral-100 pb-3 text-lg font-bold text-slate-900">
                Instructor
              </h2>

              <div className="flex flex-col items-start gap-5 sm:flex-row">
                {course.instructorPhotoUrl && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-neutral-100 bg-neutral-50 shadow-sm">
                    <AppImage
                      src={
                        getMediaUrl(course.instructorPhotoUrl) ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                      }
                      alt={course.instructorName}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{course.instructorName}</h3>
                    {course.instructorTitle && (
                      <p className="text-xs font-bold text-neutral-400">{course.instructorTitle}</p>
                    )}
                  </div>

                  {course.instructorStats && (
                    <div className="flex max-w-sm gap-4 rounded-lg border border-neutral-100 bg-neutral-50 p-2.5 text-xs font-bold text-neutral-500">
                      {course.instructorStats.averageRating > 0 && (
                        <div>
                          <span className="text-slate-800">
                            {course.instructorStats.averageRating.toFixed(1)}{" "}
                          </span>
                          Rating
                        </div>
                      )}
                      {course.instructorStats.totalStudents > 0 && (
                        <div
                          className={cn(
                            course.instructorStats.averageRating > 0 &&
                              "border-l border-neutral-200 pl-4"
                          )}
                        >
                          <span className="text-slate-800">
                            {course.instructorStats.totalStudents.toLocaleString()}{" "}
                          </span>
                          Students
                        </div>
                      )}
                      {course.instructorStats.courseCount > 0 && (
                        <div className="border-l border-neutral-200 pl-4">
                          <span className="text-slate-800">
                            {course.instructorStats.courseCount}{" "}
                          </span>
                          Courses
                        </div>
                      )}
                    </div>
                  )}

                  {course.instructorBio && (
                    <p className="text-sm font-medium leading-relaxed text-neutral-600">
                      {course.instructorBio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            id="reviews"
            className="scroll-mt-32 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:p-8"
          >
            <CourseReviewsSection
              course={course}
              onReviewSubmitted={(averageRating, reviewCount) => {
                setCourse((prev) => (prev ? { ...prev, averageRating, reviewCount } : prev))
              }}
            />
          </div>

          {course.faqs.length > 0 && (
            <div
              id="faqs"
              className="scroll-mt-32 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:p-8"
            >
              <h2 className="mb-5 border-b border-neutral-100 pb-3 text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3.5">
                {course.faqs.map((faq, index) => {
                  const isOpen = activeFaq === index
                  return (
                    <div
                      key={`${faq.question}-${index}`}
                      className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between p-4 text-left text-sm font-bold transition-colors duration-300 md:text-base",
                          isOpen
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white text-neutral-800 hover:bg-neutral-50"
                        )}
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform duration-300",
                            isOpen ? "rotate-180 text-white" : "text-neutral-400"
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-neutral-100 bg-white p-5 text-sm font-medium leading-relaxed text-neutral-600">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <CourseDetailExtras course={course} />
        </div>

        <div className="hidden lg:block">
          <CourseSidebarWidget
            course={course}
            enrolling={enrolling}
            handleEnroll={handleEnroll}
            totalLessons={totalLessons}
            displayDuration={displayDuration}
            freePreviewCount={freePreviewCount}
            onPreviewClick={() => scrollToSection("curriculum")}
          />
        </div>
      </div>

      {!course.isEnrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-t border-neutral-100 bg-white px-5 py-3.5 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] lg:hidden">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Course Price
            </span>
            <span className="text-xl font-black text-orange-500">
              {course.price === 0 ? "Free" : formatPrice(course.price)}
            </span>
          </div>

          <Button
            className="h-11 max-w-[200px] flex-1 rounded-xl bg-primary text-sm font-extrabold text-white hover:bg-primary/90"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </Button>
        </div>
      )}

      {previewLesson && (
        <Dialog open={!!previewLesson} onOpenChange={(open) => !open && setPreviewLesson(null)}>
          <DialogContent className="max-w-3xl overflow-hidden rounded-2xl border-0 bg-white p-4 shadow-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{previewLesson.title}</DialogTitle>
            </DialogHeader>
            <div className="pt-2">
              <CourseLessonPreview courseId={course.id} lesson={previewLesson} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}

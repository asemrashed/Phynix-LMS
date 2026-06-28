"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { LessonPlayer } from "@/components/learning/lesson-player"
import { CourseCompletionReviewDialog } from "@/components/course/course-completion-review-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Play,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
} from "lucide-react"
import type {
  CourseDetail,
  LessonItem,
  LessonProgressResult,
  StudentLessonDetail,
  VideoTokenResponse,
} from "@fxprime/types"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { isReviewPromptDismissed } from "@/lib/review-utils"
import { cn } from "@/lib/utils"

function LessonIcon({ type, completed }: { type: LessonItem["type"]; completed?: boolean }) {
  if (completed) return <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
  const icons = {
    VIDEO: Play,
    TEXT: FileText,
    QUIZ: HelpCircle,
  }
  const Icon = icons[type] || Play
  return <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
}

export default function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const lessonParam = searchParams.get("lesson")
  const { user } = useAuth()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [lessonDetail, setLessonDetail] = useState<StudentLessonDetail | null>(null)
  const [videoToken, setVideoToken] = useState<VideoTokenResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const prevProgressRef = useRef<number | null>(null)

  const shouldPromptReview = useCallback((data: CourseDetail) => {
    return (
      data.progress === 100 &&
      data.canReview &&
      !data.hasReviewed &&
      !isReviewPromptDismissed(data.id)
    )
  }, [])

  const openReviewIfEligible = useCallback(
    (data: CourseDetail) => {
      if (shouldPromptReview(data)) {
        setReviewDialogOpen(true)
      }
    },
    [shouldPromptReview]
  )

  const allLessons = course?.sections.flatMap((s) => s.lessons) ?? []
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId)
  const currentLesson = allLessons[currentIndex]

  const refreshCourse = useCallback(async () => {
    const data = await api<CourseDetail>(`/courses/${slug}`)
    setCourse(data)
    return data
  }, [slug])

  const loadLessonRequestRef = useRef(0)

  const loadLesson = useCallback(
    async (lessonId: string, courseData: CourseDetail) => {
      const lesson = courseData.sections
        .flatMap((s) => s.lessons)
        .find((l) => l.id === lessonId)

      if (!lesson) return

      const requestId = ++loadLessonRequestRef.current

      setLessonLoading(true)
      setVideoToken(null)
      setLessonDetail(null)

      try {
        if (lesson.type === "VIDEO") {
          const token = await api<VideoTokenResponse>(
            `/courses/${courseData.id}/lessons/${lessonId}/token`
          )
          if (requestId !== loadLessonRequestRef.current) return
          setVideoToken(token)
        } else {
          const detail = await api<StudentLessonDetail>(
            `/courses/${courseData.id}/lessons/${lessonId}`
          )
          if (requestId !== loadLessonRequestRef.current) return
          setLessonDetail(detail)
        }
      } catch (err) {
        if (requestId !== loadLessonRequestRef.current) return
        console.error("Failed to load lesson:", err)
      } finally {
        if (requestId === loadLessonRequestRef.current) {
          setLessonLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    async function init() {
      try {
        const data = await refreshCourse()
        const allLessonsList = data.sections.flatMap((s) => s.lessons)
        const paramLesson = lessonParam
          ? allLessonsList.find((l) => l.id === lessonParam)
          : null
        const firstIncomplete = allLessonsList.find((l) => !l.isCompleted)
        const firstLesson = data.sections[0]?.lessons[0]
        const lessonId =
          paramLesson?.id || firstIncomplete?.id || firstLesson?.id
        if (lessonId) {
          setCurrentLessonId(lessonId)
          await loadLesson(lessonId, data)
        }
        prevProgressRef.current = data.progress
        if (searchParams.get("review") === "1" && data.canReview && !data.hasReviewed) {
          setReviewDialogOpen(true)
        } else {
          openReviewIfEligible(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [slug, lessonParam, refreshCourse, loadLesson, searchParams, openReviewIfEligible])

  const handleLessonSelect = async (lessonId: string) => {
    setCurrentLessonId(lessonId)
    if (course) await loadLesson(lessonId, course)
  }

  const handleProgress = async (result: LessonProgressResult) => {
    const prevProgress = course?.progress ?? prevProgressRef.current ?? 0
    if (course) {
      setCourse((prev) =>
        prev ? { ...prev, progress: result.progress } : prev
      )
      const updated = await refreshCourse()
      prevProgressRef.current = updated.progress
      if (result.progress === 100 && prevProgress < 100) {
        openReviewIfEligible(updated)
      }
    }
  }

  const handleMarkVideoComplete = async () => {
    if (!course || !currentLessonId) return
    setSaving(true)
    try {
      const result = await api<LessonProgressResult>(
        `/courses/${course.id}/lessons/${currentLessonId}/progress`,
        {
          method: "POST",
          body: JSON.stringify({
            isCompleted: true,
            watchPosition: currentLesson?.duration || 0,
          }),
        }
      )
      await handleProgress(result)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const watermarkText = user?.student
    ? `${user.student.firstName} ${user.student.lastName} · ${user.student.uniqueStudentId || "FXP"}`
    : user?.email || ""

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="aspect-video rounded-[20px] bg-muted" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center">
        <p>Course not found or not enrolled</p>
        <Link href="/dashboard/courses">
          <Button className="mt-4 rounded-xl">Back to My Courses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <CourseCompletionReviewDialog
        course={course}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onReviewSubmitted={(result) => {
          setCourse((prev) =>
            prev
              ? {
                  ...prev,
                  hasReviewed: true,
                  myReview: {
                    id: result.id,
                    rating: result.rating,
                    review: result.review,
                    studentName: result.studentName,
                    createdAt: result.createdAt,
                    isOwn: true,
                  },
                  averageRating: result.averageRating,
                  reviewCount: result.reviewCount,
                }
              : prev
          )
        }}
      />

      <div className="mb-4 flex items-center gap-2">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-foreground md:text-xl">
          {course.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {currentLesson && (
            <LessonPlayer
              courseId={course.id}
              lesson={currentLesson}
              lessonDetail={lessonDetail}
              videoToken={videoToken}
              watermarkText={watermarkText}
              loading={lessonLoading}
              saving={saving}
              onProgress={handleProgress}
              onLessonReload={async () => {
                if (currentLessonId && course) {
                  const updated = await refreshCourse()
                  await loadLesson(currentLessonId, updated)
                }
              }}
            />
          )}

          {currentLesson &&
            currentLesson.type === "VIDEO" &&
            (currentLesson.watchPosition ?? 0) > 0 &&
            !currentLesson.isCompleted && (
              <p className="text-sm text-muted-foreground">
                Resuming from{" "}
                {Math.floor((currentLesson.watchPosition ?? 0) / 60)}:
                {((currentLesson.watchPosition ?? 0) % 60)
                  .toString()
                  .padStart(2, "0")}
              </p>
            )}

          {currentLesson && (
            <div className="rounded-[20px] bg-card p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold flex-1">{currentLesson.title}</h2>
                <Badge variant="outline">{currentLesson.type}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={currentIndex <= 0}
                    onClick={() => {
                      if (currentIndex > 0) {
                        handleLessonSelect(allLessons[currentIndex - 1].id)
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={currentIndex >= allLessons.length - 1}
                    onClick={() => {
                      if (currentIndex < allLessons.length - 1) {
                        handleLessonSelect(allLessons[currentIndex + 1].id)
                      }
                    }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {currentLesson.type === "VIDEO" && !currentLesson.isCompleted && (
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={handleMarkVideoComplete}
                    disabled={saving}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-card p-4 shadow-sm">
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium text-primary">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>

          <h3 className="mb-3 font-semibold">Curriculum</h3>
          <ScrollArea className="h-[500px]">
            {course.sections.map((section) => (
              <div key={section.id} className="mb-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  {section.title}
                </p>
                {section.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                      currentLessonId === lesson.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <LessonIcon type={lesson.type} completed={lesson.isCompleted} />
                    <span className="line-clamp-1 flex-1">{lesson.title}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {lesson.type.slice(0, 4)}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

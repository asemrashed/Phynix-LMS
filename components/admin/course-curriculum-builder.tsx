"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { api } from "@/lib/api"
import type { AdminCourseDetail, AdminLessonItem, AdminSectionItem, LessonType, VideoProvider } from "@fxprime/types"
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
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { uploadCourseVideo } from "@/lib/upload"
import {
  parseYoutubeId,
  VIDEO_PROVIDER_LABELS,
  youtubeThumb,
} from "@/lib/video-source"
import { AdminLessonVideoPreview } from "@/components/admin/admin-lesson-video-preview"
import { TextLessonPreview } from "@/components/admin/text-lesson-preview"
import { QuizLessonEditor } from "@/components/admin/quiz/quiz-lesson-editor"
import { getCurriculumIssues } from "@/lib/curriculum-validation"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  GripVertical,
  HelpCircle,
  Loader2,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"

const VIDEO_PROVIDERS: VideoProvider[] = ["YOUTUBE", "SELF_HOSTED"]

const LESSON_TYPES: LessonType[] = ["VIDEO", "TEXT", "QUIZ"]

const DEFAULT_NEW_LESSON: Record<
  LessonType,
  { title: string; duration: number; isFree?: boolean }
> = {
  VIDEO: { title: "Untitled Video Lesson", duration: 900 },
  TEXT: { title: "Untitled Reading", duration: 600 },
  QUIZ: { title: "Untitled Quiz", duration: 300 },
}

const LESSON_TYPE_META: Record<
  LessonType,
  { label: string; icon: typeof Play; contentPlaceholder: string }
> = {
  VIDEO: {
    label: "Video",
    icon: Play,
    contentPlaceholder: "",
  },
  TEXT: {
    label: "Reading",
    icon: FileText,
    contentPlaceholder: "Lesson content (markdown or HTML)",
  },
  QUIZ: {
    label: "Quiz",
    icon: HelpCircle,
    contentPlaceholder: "Quiz questions (JSON or text)",
  },
}

function formatTotalDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${seconds}s`
}

function secondsToMinutes(seconds: number) {
  return Math.max(0, Math.round(seconds / 60))
}

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      cancel()
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [cancel, delay]
  )

  useEffect(() => cancel, [cancel])

  return { debounced, cancel, flush: () => cancel() }
}

interface CourseCurriculumBuilderProps {
  course: AdminCourseDetail
  onCourseChange: React.Dispatch<React.SetStateAction<AdminCourseDetail | null>>
}

export function CourseCurriculumBuilder({
  course,
  onCourseChange,
}: CourseCurriculumBuilderProps) {
  const sections = course.sections
  const [newSectionTitle, setNewSectionTitle] = useState("")
  const [dragSectionId, setDragSectionId] = useState<string | null>(null)
  const [dragLesson, setDragLesson] = useState<{
    sectionId: string
    lessonId: string
  } | null>(null)
  const [showTextPreview, setShowTextPreview] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const s of course.sections) initial[s.id] = true
    return initial
  })
  const [selected, setSelected] = useState<{ sectionId: string; lessonId: string } | null>(
    null
  )
  const [lessonDraft, setLessonDraft] = useState<AdminLessonItem | null>(null)
  const [lessonSaving, setLessonSaving] = useState(false)
  const [lessonSaved, setLessonSaved] = useState(true)
  const [videoUploading, setVideoUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "section"; sectionId: string; title: string; lessonCount: number }
    | { kind: "lesson"; sectionId: string; lessonId: string; title: string }
    | null
  >(null)

  const stats = useMemo(() => {
    const lessons = sections.flatMap((s) => s.lessons)
    return {
      sectionCount: sections.length,
      lessonCount: lessons.length,
      totalDuration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
      freeCount: lessons.filter((l) => l.isFree).length,
    }
  }, [sections])

  const curriculumIssues = useMemo(
    () =>
      getCurriculumIssues({
        sections: course.sections,
        thumbnailUrl: course.thumbnailUrl,
        description: course.description,
        price: course.price,
      }),
    [course]
  )

  const selectedRef = useRef<{ sectionId: string; lessonId: string } | null>(null)

  useEffect(() => {
    if (!selected) {
      setLessonDraft(null)
      selectedRef.current = null
      return
    }

    const prev = selectedRef.current
    const selectionChanged =
      !prev ||
      prev.sectionId !== selected.sectionId ||
      prev.lessonId !== selected.lessonId

    if (selectionChanged) {
      const section = sections.find((s) => s.id === selected.sectionId)
      const lesson = section?.lessons.find((l) => l.id === selected.lessonId)
      if (lesson) {
        setLessonDraft({ ...lesson })
        setLessonSaved(true)
        setShowTextPreview(false)
      }
      selectedRef.current = selected
    }
  }, [selected, sections])

  const persistLesson = useCallback(
    async (sectionId: string, lessonId: string, patch: Partial<AdminLessonItem>) => {
      setLessonSaving(true)
      setLessonSaved(false)
      try {
        await api(`/admin/courses/${course.id}/sections/${sectionId}/lessons/${lessonId}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        })
        onCourseChange((prev) =>
          prev
            ? {
                ...prev,
                sections: prev.sections.map((s) =>
                  s.id === sectionId
                    ? {
                        ...s,
                        lessons: s.lessons.map((l) =>
                          l.id === lessonId ? { ...l, ...patch } : l
                        ),
                      }
                    : s
                ),
              }
            : prev
        )
        setLessonSaved(true)
      } catch {
        toast.error("Failed to save lesson")
      } finally {
        setLessonSaving(false)
      }
    },
    [course.id, onCourseChange]
  )

  const { debounced: debouncedPersistLesson, cancel: cancelLessonDebounce } =
    useDebouncedCallback(persistLesson, 800)

  const updateLessonDraft = (patch: Partial<AdminLessonItem>) => {
    if (!lessonDraft || !selected) return
    const next = { ...lessonDraft, ...patch }
    setLessonDraft(next)
    setLessonSaved(false)
    onCourseChange((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === selected.sectionId
                ? {
                    ...s,
                    lessons: s.lessons.map((l) =>
                      l.id === selected.lessonId ? next : l
                    ),
                  }
                : s
            ),
          }
        : prev
    )
    debouncedPersistLesson(selected.sectionId, selected.lessonId, patch)
  }

  const addSection = async () => {
    if (!newSectionTitle.trim()) return
    try {
      const section = await api<AdminSectionItem>(`/admin/courses/${course.id}/sections`, {
        method: "POST",
        body: JSON.stringify({ title: newSectionTitle.trim() }),
      })
      onCourseChange((prev) =>
        prev ? { ...prev, sections: [...prev.sections, section] } : prev
      )
      setExpandedSections((prev) => ({ ...prev, [section.id]: true }))
      setNewSectionTitle("")
      toast.success("Section added")
    } catch {
      toast.error("Failed to add section")
    }
  }

  const saveSectionTitle = async (section: AdminSectionItem) => {
    try {
      await api(`/admin/courses/${course.id}/sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: section.title }),
      })
    } catch {
      toast.error("Failed to update section title")
    }
  }

  const { debounced: debouncedSaveSectionTitle } = useDebouncedCallback(saveSectionTitle, 600)

  const moveSection = async (sectionId: string, direction: "up" | "down") => {
    const idx = sections.findIndex((s) => s.id === sectionId)
    if (idx < 0) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sections.length) return

    const orderedIds = sections.map((s) => s.id)
    ;[orderedIds[idx], orderedIds[swapIdx]] = [orderedIds[swapIdx], orderedIds[idx]]

    try {
      const reordered = await api<AdminSectionItem[]>(
        `/admin/courses/${course.id}/sections/reorder`,
        { method: "PATCH", body: JSON.stringify({ orderedIds }) }
      )
      onCourseChange((prev) => (prev ? { ...prev, sections: reordered } : prev))
    } catch {
      toast.error("Failed to reorder sections")
    }
  }

  const confirmDeleteSection = async (sectionId: string) => {
    try {
      await api(`/admin/courses/${course.id}/sections/${sectionId}`, { method: "DELETE" })
      onCourseChange((prev) =>
        prev
          ? { ...prev, sections: prev.sections.filter((s) => s.id !== sectionId) }
          : prev
      )
      if (selected?.sectionId === sectionId) setSelected(null)
      toast.success("Section deleted")
    } catch {
      toast.error("Failed to delete section")
    }
  }

  const addLesson = async (sectionId: string, type: LessonType = "VIDEO") => {
    const defaults = DEFAULT_NEW_LESSON[type]
    try {
      const lesson = await api<AdminLessonItem>(
        `/admin/courses/${course.id}/sections/${sectionId}/lessons`,
        {
          method: "POST",
          body: JSON.stringify({
            title: defaults.title,
            type,
            duration: defaults.duration,
            isFree: defaults.isFree ?? false,
          }),
        }
      )
      onCourseChange((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s
              ),
            }
          : prev
      )
      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }))
      setSelected({ sectionId, lessonId: lesson.id })
    } catch {
      toast.error("Failed to add lesson")
    }
  }

  const moveLesson = async (sectionId: string, lessonId: string, direction: "up" | "down") => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const idx = section.lessons.findIndex((l) => l.id === lessonId)
    if (idx < 0) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= section.lessons.length) return

    const orderedIds = section.lessons.map((l) => l.id)
    ;[orderedIds[idx], orderedIds[swapIdx]] = [orderedIds[swapIdx], orderedIds[idx]]

    try {
      const reordered = await api<AdminLessonItem[]>(
        `/admin/courses/${course.id}/sections/${sectionId}/lessons/reorder`,
        { method: "PATCH", body: JSON.stringify({ orderedIds }) }
      )
      onCourseChange((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId ? { ...s, lessons: reordered } : s
              ),
            }
          : prev
      )
    } catch {
      toast.error("Failed to reorder lessons")
    }
  }

  const confirmDeleteLesson = async (sectionId: string, lessonId: string) => {
    cancelLessonDebounce()
    try {
      await api(`/admin/courses/${course.id}/sections/${sectionId}/lessons/${lessonId}`, {
        method: "DELETE",
      })
      onCourseChange((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId
                  ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
                  : s
              ),
            }
          : prev
      )
      if (selected?.lessonId === lessonId) setSelected(null)
      toast.success("Lesson deleted")
    } catch {
      toast.error("Failed to delete lesson")
    }
  }

  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null)

  const LESSON_TYPE_STYLES: Record<
    LessonType,
    { bg: string; text: string; iconBg: string; iconText: string; border: string }
  > = {
    VIDEO: {
      bg: "bg-primary/10 hover:bg-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10",
      text: "text-amber-900 dark:text-amber-100",
      iconBg: "bg-primary/20 dark:bg-primary/10",
      iconText: "text-amber-800 dark:text-amber-300",
      border: "border-primary/20 dark:border-primary/10",
    },
    TEXT: {
      bg: "bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-emerald-950/5 dark:hover:bg-emerald-950/10",
      text: "text-emerald-900 dark:text-emerald-100",
      iconBg: "bg-emerald-100/80 dark:bg-emerald-900/40",
      iconText: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-100/50 dark:border-emerald-900/20",
    },
    QUIZ: {
      bg: "bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/5 dark:hover:bg-amber-950/10",
      text: "text-amber-900 dark:text-amber-100",
      iconBg: "bg-amber-100/80 dark:bg-amber-900/40",
      iconText: "text-amber-700 dark:text-amber-300",
      border: "border-amber-100/50 dark:border-amber-900/20",
    },
  }

  const activeTypeStyle = lessonDraft ? LESSON_TYPE_STYLES[lessonDraft.type] : null
  const ActiveLessonIcon = lessonDraft ? LESSON_TYPE_META[lessonDraft.type].icon : null

  const onSectionDragStart = (sectionId: string) => setDragSectionId(sectionId)

  const handleSectionDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (dragSectionId === targetId) return
    setDragOverSectionId(targetId)
  }

  const handleSectionDragLeave = () => {
    setDragOverSectionId(null)
  }

  const handleSectionDrop = async (targetId: string) => {
    setDragOverSectionId(null)
    if (!dragSectionId || dragSectionId === targetId) return
    const orderedIds = [...sections.map((s) => s.id)]
    const fromIdx = orderedIds.indexOf(dragSectionId)
    const toIdx = orderedIds.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0) return
    orderedIds.splice(fromIdx, 1)
    orderedIds.splice(toIdx, 0, dragSectionId)
    setDragSectionId(null)

    try {
      const reordered = await api<AdminSectionItem[]>(
        `/admin/courses/${course.id}/sections/reorder`,
        { method: "PATCH", body: JSON.stringify({ orderedIds }) }
      )
      onCourseChange((prev) => (prev ? { ...prev, sections: reordered } : prev))
      toast.success("Section reordered")
    } catch {
      toast.error("Failed to reorder sections")
    }
  }

  const handleLessonDragOver = (e: React.DragEvent, lessonId: string) => {
    e.preventDefault()
    if (dragLesson?.lessonId === lessonId) return
    setDragOverLessonId(lessonId)
  }

  const handleLessonDragLeave = () => {
    setDragOverLessonId(null)
  }

  const handleLessonDrop = async (sectionId: string, targetLessonId: string) => {
    setDragOverLessonId(null)
    if (!dragLesson || dragLesson.sectionId !== sectionId) return
    if (dragLesson.lessonId === targetLessonId) {
      setDragLesson(null)
      return
    }

    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const orderedIds = section.lessons.map((l) => l.id)
    const fromIdx = orderedIds.indexOf(dragLesson.lessonId)
    const toIdx = orderedIds.indexOf(targetLessonId)
    if (fromIdx < 0 || toIdx < 0) return

    orderedIds.splice(fromIdx, 1)
    orderedIds.splice(toIdx, 0, dragLesson.lessonId)
    setDragLesson(null)

    try {
      const reordered = await api<AdminLessonItem[]>(
        `/admin/courses/${course.id}/sections/${sectionId}/lessons/reorder`,
        { method: "PATCH", body: JSON.stringify({ orderedIds }) }
      )
      onCourseChange((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId ? { ...s, lessons: reordered } : s
              ),
            }
          : prev
      )
      toast.success("Lesson reordered")
    } catch {
      toast.error("Failed to reorder lessons")
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <div className="space-y-6">
      {/* Header and Student Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Course Syllabus & Curriculum</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize modules, manage lectures, and configure settings.
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl bg-white shadow-xs self-start sm:self-auto" asChild>
          <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 size-4 text-muted-foreground" />
            Preview as student
          </a>
        </Button>
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="p-3 bg-primary/10 dark:bg-primary/5 text-amber-800 dark:text-amber-400 rounded-xl shrink-0">
            <FolderOpen className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs text-muted-foreground font-medium">Modules</span>
            <span className="text-xl font-bold text-foreground truncate">{stats.sectionCount}</span>
          </div>
        </div>

        <div className="bg-card border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs text-muted-foreground font-medium">Lectures</span>
            <span className="text-xl font-bold text-foreground truncate">{stats.lessonCount}</span>
          </div>
        </div>

        <div className="bg-card border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Clock className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs text-muted-foreground font-medium">Total Duration</span>
            <span className="text-lg font-bold text-foreground truncate">{formatTotalDuration(stats.totalDuration)}</span>
          </div>
        </div>

        <div className="bg-card border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs text-muted-foreground font-medium">Previews</span>
            <span className="text-xl font-bold text-foreground truncate">{stats.freeCount} free preview</span>
          </div>
        </div>
      </div>

      {/* Warnings & Issues */}
      {curriculumIssues.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20 animate-pulse-subtle">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="size-4.5 shrink-0 text-amber-600" />
            <span>{curriculumIssues.length} issue{curriculumIssues.length > 1 ? "s" : ""} to resolve before publishing</span>
          </div>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-amber-700 dark:text-amber-300">
            {curriculumIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Module Bar */}
      <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          className="rounded-xl border border-slate-200 bg-slate-50/50 focus-visible:bg-white transition-colors h-11"
          placeholder="Enter new module title (e.g., Module 1: Introduction to IELTS)"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void addSection()}
        />
        <Button className="shrink-0 rounded-xl h-11 px-5 font-medium bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => void addSection()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Module
        </Button>
      </div>

      {/* Main Grid */}
      {sections.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-card p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            <FolderOpen className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No modules yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Get started by adding your first learning module above. You can then add video lessons, readings, and quizzes.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Left Column: Syllabus Tree */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground font-medium">
                Drag modules or lectures to reorder · Click a lecture to edit details
              </p>
            </div>

            <div className="space-y-4">
              {sections.map((section, sIdx) => {
                const expanded = expandedSections[section.id] !== false
                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => onSectionDragStart(section.id)}
                    onDragOver={(e) => handleSectionDragOver(e, section.id)}
                    onDragLeave={handleSectionDragLeave}
                    onDrop={() => void handleSectionDrop(section.id)}
                    className={cn(
                      "rounded-2xl border border-slate-200 bg-card shadow-xs transition-all duration-200 overflow-hidden",
                      dragSectionId === section.id && "opacity-40 border-dashed",
                      dragOverSectionId === section.id && "border-primary ring-2 ring-primary/20 scale-[1.005]"
                    )}
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-3 py-2.5">
                      <GripVertical className="size-4.5 shrink-0 cursor-grab text-muted-foreground opacity-30 hover:opacity-80 transition-opacity" />
                      <button
                        type="button"
                        className="rounded-lg p-1 hover:bg-slate-200/50 text-muted-foreground"
                        onClick={() => toggleSection(section.id)}
                      >
                        {expanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </button>
                      <Input
                        className="h-9 flex-1 rounded-lg border-0 bg-transparent px-2 font-semibold text-base shadow-none hover:bg-white/80 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-0 transition-all"
                        value={section.title}
                        onChange={(e) => {
                          const title = e.target.value
                          onCourseChange((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sections: prev.sections.map((s) =>
                                    s.id === section.id ? { ...s, title } : s
                                  ),
                                }
                              : prev
                          )
                          debouncedSaveSectionTitle({ ...section, title })
                        }}
                      />
                      <span className="hidden text-xs font-semibold text-muted-foreground sm:inline bg-white border border-slate-150 px-2.5 py-1 rounded-lg shadow-2xs">
                        {section.lessons.length} {section.lessons.length === 1 ? "lecture" : "lectures"}
                      </span>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg hover:bg-slate-200/40"
                          disabled={sIdx === 0}
                          onClick={() => void moveSection(section.id, "up")}
                        >
                          <ChevronUp className="size-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg hover:bg-slate-200/40"
                          disabled={sIdx === sections.length - 1}
                          onClick={() => void moveSection(section.id, "down")}
                        >
                          <ChevronDown className="size-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              kind: "section",
                              sectionId: section.id,
                              title: section.title,
                              lessonCount: section.lessons.length,
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 rounded-lg bg-white shadow-xs border-slate-200 hover:border-slate-350">
                              <Plus className="mr-1 size-3.5" />
                              Add Lecture
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            {LESSON_TYPES.map((type) => {
                              const meta = LESSON_TYPE_META[type]
                              const Icon = meta.icon
                              return (
                                <DropdownMenuItem
                                  key={type}
                                  className="cursor-pointer"
                                  onClick={() => void addLesson(section.id, type)}
                                >
                                  <Icon className="mr-2 size-4 text-muted-foreground" />
                                  {meta.label}
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Section Lessons List */}
                    {expanded && (
                      <div className="p-3 space-y-2 bg-card">
                        {section.lessons.map((lesson, lIdx) => {
                          const meta = LESSON_TYPE_META[lesson.type]
                          const Icon = meta.icon
                          const isSelected =
                            selected?.sectionId === section.id &&
                            selected?.lessonId === lesson.id
                          const typeStyle = LESSON_TYPE_STYLES[lesson.type]

                          return (
                            <div key={lesson.id} className="space-y-1">
                              <div
                                draggable
                                onDragStart={() =>
                                  setDragLesson({ sectionId: section.id, lessonId: lesson.id })
                                }
                                onDragOver={(e) => handleLessonDragOver(e, lesson.id)}
                                onDragLeave={handleLessonDragLeave}
                                onDrop={() => void handleLessonDrop(section.id, lesson.id)}
                                className={cn(
                                  "group flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-200 cursor-pointer",
                                  isSelected
                                    ? "bg-primary/5 border-primary border-l-4 border-l-primary shadow-xs"
                                    : cn("bg-card hover:bg-slate-50/50 hover:shadow-xs border-slate-150", typeStyle.bg),
                                  dragLesson?.lessonId === lesson.id && "opacity-40",
                                  dragOverLessonId === lesson.id && "border-primary scale-[1.005]"
                                )}
                              >
                                <GripVertical className="size-4.5 shrink-0 cursor-grab text-muted-foreground opacity-15 group-hover:opacity-80 transition-opacity" />
                                <div
                                  className="flex min-w-0 flex-1 items-center gap-3 text-left animate-fade-in"
                                  onClick={() =>
                                    setSelected({ sectionId: section.id, lessonId: lesson.id })
                                  }
                                >
                                  <div className={cn("p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105", typeStyle.iconBg, typeStyle.iconText)}>
                                    <Icon className="size-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="block truncate font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                                      {lesson.title}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[11px] text-muted-foreground font-mono">
                                        {LESSON_TYPE_META[lesson.type].label}
                                      </span>
                                      {lesson.isFree && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-primary/20">
                                          Free Preview
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="ml-auto shrink-0 text-xs text-muted-foreground font-medium bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md shadow-3xs">
                                    {formatTotalDuration(lesson.duration)}
                                  </span>
                                </div>

                                {/* Lesson Actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-lg hover:bg-slate-200/40"
                                    disabled={lIdx === 0}
                                    onClick={() => void moveLesson(section.id, lesson.id, "up")}
                                  >
                                    <ChevronUp className="size-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-lg hover:bg-slate-200/40"
                                    disabled={lIdx === section.lessons.length - 1}
                                    onClick={() => void moveLesson(section.id, lesson.id, "down")}
                                  >
                                    <ChevronDown className="size-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-lg text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      setDeleteTarget({
                                        kind: "lesson",
                                        sectionId: section.id,
                                        lessonId: lesson.id,
                                        title: lesson.title,
                                      })
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Drag indicator line */}
                              {dragOverLessonId === lesson.id && (
                                <div className="h-1 bg-primary rounded-full my-1 animate-pulse" />
                              )}
                            </div>
                          )
                        })}

                        {section.lessons.length === 0 && (
                          <div className="rounded-xl border border-dashed bg-slate-50/50 p-6 text-center border-slate-200">
                            <p className="text-xs text-muted-foreground">
                              No lectures added. Click below to add your first lecture.
                            </p>
                          </div>
                        )}

                        {/* Inline Add Lesson Control */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-3 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer shadow-3xs"
                            >
                              <Plus className="size-4" />
                              Add lecture to module
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="bg-white">
                            {LESSON_TYPES.map((type) => {
                              const meta = LESSON_TYPE_META[type]
                              const Icon = meta.icon
                              return (
                                <DropdownMenuItem
                                  key={type}
                                  className="cursor-pointer"
                                  onClick={() => void addLesson(section.id, type)}
                                >
                                  <Icon className="mr-2 size-4 text-muted-foreground" />
                                  {meta.label}
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Editing details pane */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {lessonDraft && selected && activeTypeStyle && ActiveLessonIcon ? (
              <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm border-slate-200">
                {/* Editor Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-lg shrink-0", activeTypeStyle.iconBg, activeTypeStyle.iconText)}>
                      <ActiveLessonIcon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm truncate">Edit Lecture</h3>
                      <p className="text-[11px] text-muted-foreground capitalize font-medium">{lessonDraft.type.toLowerCase()} content</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                    {lessonSaving ? (
                      <span className="flex items-center gap-1 text-amber-800">
                        <Loader2 className="size-3 animate-spin" />
                        Saving...
                      </span>
                    ) : lessonSaved ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Check className="size-3" />
                        Saved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Unsaved
                      </span>
                    )}
                  </div>
                </div>

                {/* General settings card */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-title" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lecture Title</Label>
                    <Input
                      id="lesson-title"
                      className="rounded-xl border-slate-200 h-10 bg-slate-50/50 focus:bg-white focus:ring-primary/20 transition-all"
                      value={lessonDraft.title}
                      onChange={(e) => updateLessonDraft({ title: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</Label>
                      <Select
                        value={lessonDraft.type}
                        onValueChange={(v) =>
                          updateLessonDraft({ type: v as LessonType })
                        }
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 h-10 bg-slate-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {LESSON_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {LESSON_TYPE_META[t].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-duration" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration (min)</Label>
                      <Input
                        id="lesson-duration"
                        type="number"
                        min={0}
                        className="rounded-xl border-slate-200 h-10 bg-slate-50/50 focus:bg-white transition-all"
                        value={secondsToMinutes(lessonDraft.duration)}
                        onChange={(e) =>
                          updateLessonDraft({
                            duration: Math.max(0, Number(e.target.value) || 0) * 60,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Access Switch Box */}
                <div className="flex items-center justify-between rounded-2xl border bg-slate-50/30 p-3.5 border-slate-100">
                  <div className="max-w-[75%]">
                    <Label htmlFor="lesson-free" className="text-sm font-semibold text-slate-800">Free Preview</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                      Allow users to view this lecture before buying the course. Best for 1-2 introductory clips.
                    </p>
                    {lessonDraft.isFree && lessonDraft.type !== "VIDEO" && (
                      <p className="mt-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        Note: Only Video lectures support public student preview.
                        Free courses already unlock all content.
                      </p>
                    )}
                  </div>
                  <Switch
                    id="lesson-free"
                    checked={lessonDraft.isFree}
                    onCheckedChange={(v) => updateLessonDraft({ isFree: v })}
                    disabled={lessonDraft.type !== "VIDEO"}
                  />
                </div>

                {/* Video Settings */}
                {lessonDraft.type === "VIDEO" && (
                  <div className="space-y-4">
                    {/* Video source configuration */}
                    <div className="space-y-4 rounded-2xl border p-4 bg-slate-50/30 border-slate-100">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Video Source Provider</Label>
                        <Select
                          value={lessonDraft.videoProvider ?? "YOUTUBE"}
                          onValueChange={(v) => {
                            const provider = v as VideoProvider
                            updateLessonDraft({
                              videoProvider: provider,
                              videoRef: null,
                            })
                          }}
                        >
                          <SelectTrigger className="rounded-xl border-slate-200 h-10 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {VIDEO_PROVIDERS.map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {VIDEO_PROVIDER_LABELS[provider]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(lessonDraft.videoProvider ?? "YOUTUBE") === "YOUTUBE" && (
                        <div className="space-y-2">
                          <Label htmlFor="youtube-ref" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">YouTube URL or ID</Label>
                          <Input
                            id="youtube-ref"
                            className="rounded-xl border-slate-200 h-10 bg-white"
                            placeholder="e.g., https://youtube.com/watch?v=..."
                            value={lessonDraft.videoRef ?? ""}
                            onChange={(e) => {
                              const parsed = parseYoutubeId(e.target.value)
                              updateLessonDraft({
                                videoProvider: "YOUTUBE",
                                videoRef: parsed,
                              })
                            }}
                          />
                          {lessonDraft.videoRef && (
                            <div className="mt-2 overflow-hidden rounded-xl border border-slate-100 aspect-video shadow-xs bg-slate-100">
                              <img
                                src={youtubeThumb(lessonDraft.videoRef)}
                                alt="YouTube preview"
                                className="h-full w-full object-cover animate-fade-in"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {lessonDraft.videoProvider === "SELF_HOSTED" && selected && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="course-video-file" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Video File</Label>
                            <Input
                              id="course-video-file"
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                              className="rounded-xl border-slate-200 bg-white"
                              disabled={videoUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file || !selected) return
                                setVideoUploading(true)
                                void uploadCourseVideo(
                                  course.id,
                                  selected.sectionId,
                                  selected.lessonId,
                                  file
                                )
                                  .then((result) => {
                                    updateLessonDraft({
                                      videoProvider: result.videoProvider,
                                      videoRef: result.videoRef,
                                    })
                                    toast.success("Video uploaded")
                                  })
                                  .catch(() => toast.error("Failed to upload video"))
                                  .finally(() => {
                                    setVideoUploading(false)
                                    e.target.value = ""
                                  })
                              }}
                            />
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                              MP4, WebM, or MOV — max 500MB. Served via secure signed streams.
                            </p>
                          </div>
                          {lessonDraft.videoRef && (
                            <div className="flex items-center gap-2 rounded-xl border bg-emerald-50/30 border-emerald-100 px-3 py-2 text-xs font-medium text-emerald-800">
                              <Upload className="size-4 shrink-0 text-emerald-600" />
                              <span className="truncate">{lessonDraft.videoRef}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Video Player Preview Section */}
                    <div className="pt-2 border-t border-slate-100">
                      <AdminLessonVideoPreview courseId={course.id} lesson={lessonDraft} />
                    </div>
                  </div>
                )}

                {/* Quiz Settings */}
                {lessonDraft.type === "QUIZ" && (
                  <div className="pt-2 border-t border-slate-100">
                    <QuizLessonEditor
                      key={selected.lessonId}
                      value={lessonDraft.content}
                      onChange={(json) => updateLessonDraft({ content: json })}
                    />
                  </div>
                )}

                {/* Reading / Markdown Settings */}
                {lessonDraft.type !== "VIDEO" && lessonDraft.type !== "QUIZ" && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="lesson-content" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reading Content</Label>
                      {lessonDraft.type === "TEXT" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-lg text-xs hover:bg-slate-150 font-semibold"
                          onClick={() => setShowTextPreview((v) => !v)}
                        >
                          {showTextPreview ? "Edit Mode" : "Preview Mode"}
                        </Button>
                      )}
                    </div>
                    {showTextPreview && lessonDraft.type === "TEXT" ? (
                      <div className="rounded-xl border bg-slate-50/50 p-4 min-h-[140px] border-slate-200">
                        <TextLessonPreview content={lessonDraft.content ?? ""} />
                      </div>
                    ) : (
                      <Textarea
                        id="lesson-content"
                        className="min-h-[160px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm leading-relaxed"
                        placeholder={LESSON_TYPE_META[lessonDraft.type].contentPlaceholder}
                        value={lessonDraft.content ?? ""}
                        onChange={(e) =>
                          updateLessonDraft({ content: e.target.value || null })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-slate-50/20 p-8 text-center border-slate-200">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-150 text-slate-400 mb-3">
                  <BookOpen className="size-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No lecture selected</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Select a lecture from the curriculum outline on the left to edit its settings and content.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AlertDialogs */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.kind === "section" ? "module" : "lecture"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.kind === "section" ? (
                <>
                  Are you sure you want to delete module <strong>{deleteTarget.title}</strong>? This action cannot be undone and will permanently delete all{" "}
                  <strong>{deleteTarget.lessonCount}</strong> lectures inside it.
                </>
              ) : (
                <>
                  Are you sure you want to delete lecture <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteTarget) return
                if (deleteTarget.kind === "section") {
                  void confirmDeleteSection(deleteTarget.sectionId)
                } else {
                  void confirmDeleteLesson(deleteTarget.sectionId, deleteTarget.lessonId)
                }
                setDeleteTarget(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { getCurriculumPublishIssues } from "@/lib/curriculum-validation"

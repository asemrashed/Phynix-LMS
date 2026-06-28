"use client"

import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"
import { Button } from "@/components/ui/button"
import {
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { motion } from "framer-motion"
import type { CourseDetail } from "@fxprime/types"
import { getMediaUrl } from "@/lib/media-url"
import { resolveCourseHighlights } from "@/lib/course-highlights"

interface CourseSidebarWidgetProps {
  course: CourseDetail
  enrolling: boolean
  handleEnroll: () => void
  totalLessons: number
  displayDuration: string
  freePreviewCount: number
  onPreviewClick?: () => void
}

import { formatPrice as formatBdtPrice } from "@/lib/money"

const formatCoursePrice = (price: number) => formatBdtPrice(price)

export function CourseSidebarWidget({
  course,
  enrolling,
  handleEnroll,
  totalLessons,
  displayDuration,
  freePreviewCount,
  onPreviewClick,
}: CourseSidebarWidgetProps) {
  const discountPercent =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : 0

  const benefits = resolveCourseHighlights(
    course,
    totalLessons,
    displayDuration,
    freePreviewCount
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-24 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
    >
      <div className="mb-5 relative aspect-video overflow-hidden rounded-xl border border-neutral-100 bg-neutral-900 shadow-sm">
        <AppImage
          src={
            getMediaUrl(course.thumbnailUrl) ||
            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop"
          }
          alt={course.title}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-extrabold text-orange-500">
          {course.price === 0 ? "Free" : formatCoursePrice(course.price)}
        </span>
        {course.originalPrice && course.originalPrice > course.price && (
          <>
            <span className="text-base text-neutral-400 line-through">
              {formatCoursePrice(course.originalPrice)}
            </span>
            <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      {course.installmentPlan && (
        <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 text-xs font-medium text-emerald-600">
          Pay in {course.installmentPlan.installmentCount} installments —{" "}
          {course.installmentPlan.label}
        </p>
      )}

      {course.classSchedule && (
        <div className="mb-6 flex items-center gap-3 border-t border-b border-neutral-100 py-4 text-sm font-medium text-neutral-700">
          <Clock className="h-4 w-4 text-neutral-400" />
          <span>Class time: {course.classSchedule}</span>
        </div>
      )}

      <div className="space-y-3">
        {course.isEnrolled ? (
          <Link href={`/dashboard/courses/${course.slug}`} className="block w-full">
            <Button className="h-11 w-full rounded-xl bg-primary font-bold text-white shadow-md transition-all hover:bg-primary/90">
              View Course
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <>
            <Button
              className="h-12 w-full rounded-xl border-0 bg-primary text-base font-bold text-white shadow-md transition-all hover:bg-primary/90"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </Button>
            {freePreviewCount > 0 && onPreviewClick && (
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border border-primary/30 font-bold text-sidebar-accent-foreground transition-all hover:bg-primary/10"
                onClick={onPreviewClick}
              >
                Watch Free Preview
              </Button>
            )}
          </>
        )}
      </div>

      {course.refundDays != null && course.refundDays > 0 && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-400">
          <ShieldCheck className="h-4 w-4 text-neutral-400" />
          <span>{course.refundDays} days money back guarantee</span>
        </div>
      )}

      {benefits.length > 0 && (
        <div className="mt-6 border-t border-neutral-100 pt-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
            What you get in this course:
          </h4>
          <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!course.isEnrolled && course.price > 0 && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3 text-xs text-neutral-500">
          <Award className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-accent-foreground" />
          <span>Complete all lessons to earn a verifiable certificate.</span>
        </div>
      )}
    </motion.div>
  )
}

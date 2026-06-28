"use client"

import { useEffect, useState } from "react"
import type { CourseDetail, CourseReviewItem } from "@fxprime/types"
import { CourseReviewForm } from "@/components/course/course-review-form"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { REVIEW_PROGRESS_THRESHOLD } from "@/lib/review-utils"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CourseReviewsSectionProps {
  course: CourseDetail
  onReviewSubmitted?: (averageRating: number, reviewCount: number) => void
}

export function CourseReviewsSection({
  course,
  onReviewSubmitted,
}: CourseReviewsSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<CourseReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<CourseReviewItem[]>(`/courses/${course.id}/reviews`)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [course.id])

  const showReviewForm =
    course.isEnrolled && user && (course.canReview || course.myReview)

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-foreground">Student Reviews</h2>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Star className="size-4 fill-amber-400 text-amber-400" />
        <span>
          {course.averageRating > 0 ? course.averageRating.toFixed(1) : "No ratings yet"}
          {course.reviewCount ? ` · ${course.reviewCount} reviews` : ""}
        </span>
      </div>

      {course.isEnrolled && user && !course.canReview && !course.myReview && (
        <p className="mt-4 rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Complete at least {REVIEW_PROGRESS_THRESHOLD}% of the course to leave a review.
          You are currently at {course.progress}%.
        </p>
      )}

      {showReviewForm && (
        <div className="mt-6 rounded-[20px] bg-card p-6 shadow-sm">
          <h3 className="font-semibold">
            {course.myReview ? "Update your review" : "Leave a review"}
          </h3>
          <div className="mt-4">
            <CourseReviewForm
              courseId={course.id}
              initialRating={course.myReview?.rating ?? 0}
              initialReview={course.myReview?.review ?? ""}
              isUpdate={!!course.myReview}
              onSubmitted={(result) => {
                onReviewSubmitted?.(result.averageRating, result.reviewCount)
                api<CourseReviewItem[]>(`/courses/${course.id}/reviews`)
                  .then(setReviews)
                  .catch(() => toast.error("Failed to refresh reviews"))
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((item) => (
            <div key={item.id} className={cn("rounded-[20px] bg-card p-4 shadow-sm")}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.studentName}</p>
                  {item.isOwn && item.isPublished === false && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      Pending approval
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i < item.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
              {item.review && (
                <p className="mt-2 text-sm text-muted-foreground">{item.review}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import type { CourseReviewItem } from "@fxprime/types"
import { StarRatingInput } from "@/components/star-rating-input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CourseReviewFormProps {
  courseId: string
  initialRating?: number
  initialReview?: string
  isUpdate?: boolean
  submitLabel?: string
  compact?: boolean
  onSubmitted?: (result: CourseReviewItem & { averageRating: number; reviewCount: number }) => void
}

export function CourseReviewForm({
  courseId,
  initialRating = 0,
  initialReview = "",
  isUpdate = false,
  submitLabel,
  compact = false,
  onSubmitted,
}: CourseReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [reviewText, setReviewText] = useState(initialReview)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a star rating")
      return
    }
    setSubmitting(true)
    try {
      const result = await api<
        CourseReviewItem & { averageRating: number; reviewCount: number }
      >(`/courses/${courseId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          review: reviewText.trim() || undefined,
        }),
      })
      onSubmitted?.(result)
      toast.success(
        isUpdate
          ? "Review updated and sent for approval"
          : "Thank you! Your review was submitted and is pending approval."
      )
    } catch (err) {
      if (err instanceof ApiError && err.code === "CANNOT_REVIEW_YET") {
        toast.error(err.message)
      } else {
        toast.error("Failed to submit review")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <Label>Rating</Label>
        <div className="mt-2">
          <StarRatingInput value={rating} onChange={setRating} size={compact ? "sm" : "md"} />
        </div>
      </div>
      <div>
        <Label htmlFor={`course-review-${courseId}`}>Comment (optional)</Label>
        <Textarea
          id={`course-review-${courseId}`}
          className="mt-1 rounded-xl"
          rows={compact ? 3 : 4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What did you learn? What helped most?"
        />
      </div>
      <Button className="rounded-xl" onClick={handleSubmit} disabled={submitting || !rating}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          submitLabel ?? (isUpdate ? "Update Review" : "Submit Review")
        )}
      </Button>
    </div>
  )
}

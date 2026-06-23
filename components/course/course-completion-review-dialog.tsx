"use client"

import type { CourseDetail, CourseReviewItem } from "@fxprime/types"
import { CourseReviewForm } from "@/components/course/course-review-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import Link from "next/link"
import { dismissReviewPrompt } from "@/lib/review-utils"

interface CourseCompletionReviewDialogProps {
  course: CourseDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  onReviewSubmitted?: (
    result: CourseReviewItem & { averageRating: number; reviewCount: number }
  ) => void
}

export function CourseCompletionReviewDialog({
  course,
  open,
  onOpenChange,
  onReviewSubmitted,
}: CourseCompletionReviewDialogProps) {
  const handleSkip = () => {
    dismissReviewPrompt(course.id)
    onOpenChange(false)
  }

  const handleSubmitted = (
    result: CourseReviewItem & { averageRating: number; reviewCount: number }
  ) => {
    onReviewSubmitted?.(result)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[20px]">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Course complete!</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations on finishing <strong>{course.title}</strong>. How was your
            experience?
          </DialogDescription>
        </DialogHeader>

        <CourseReviewForm
          courseId={course.id}
          compact
          submitLabel="Submit Review"
          onSubmitted={handleSubmitted}
        />

        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <Button variant="ghost" className="rounded-xl" onClick={handleSkip}>
            Maybe later
          </Button>
          {course.certificateStatus === "ISSUED" && (
            <Link href="/dashboard/certificates" className="text-center">
              <Button variant="link" className="text-sm text-primary">
                View your certificate
              </Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

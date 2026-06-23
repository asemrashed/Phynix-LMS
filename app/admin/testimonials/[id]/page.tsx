"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { TestimonialItem } from "@fxprime/types"
import { TestimonialEditor } from "@/components/admin/testimonial-editor"
import { Spinner } from "@/components/ui/spinner"

export default function EditTestimonialPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [item, setItem] = useState<TestimonialItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<TestimonialItem>(`/admin/testimonials/${id}`)
      .then(setItem)
      .catch(() => router.push("/admin/testimonials"))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!item) return null

  return <TestimonialEditor mode="edit" initial={item} />
}

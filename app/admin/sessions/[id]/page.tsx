"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { AdminLiveSessionDetail } from "@fxprime/types"
import { SessionEditor } from "@/components/admin/session-editor"
import { Spinner } from "@/components/ui/spinner"

export default function EditSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [session, setSession] = useState<AdminLiveSessionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<AdminLiveSessionDetail>(`/admin/sessions/${sessionId}`)
      .then(setSession)
      .catch(() => router.push("/admin/sessions"))
      .finally(() => setLoading(false))
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!session) return null

  return <SessionEditor mode="edit" initialSession={session} />
}

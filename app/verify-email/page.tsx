"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getDefaultPanelPath } from "@/lib/get-default-panel"
import { resolveApiUrl } from "@/lib/api-url"

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { user, refreshUser } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }
    fetch(resolveApiUrl(`/auth/verify-email?token=${token}`), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(async (json) => {
        if (json.success) {
          await refreshUser()
          setStatus("success")
        } else {
          setStatus("error")
        }
      })
      .catch(() => setStatus("error"))
  }, [token, refreshUser])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        {status === "success" ? (
          <>
            <CheckCircle className="mx-auto size-16 text-green-500" />
            <h1 className="mt-6 text-2xl font-bold">Email Verified!</h1>
            <p className="mt-4 text-muted-foreground">
              Your email has been verified. You can now enroll, pay, and subscribe.
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-16 text-destructive" />
            <h1 className="mt-6 text-2xl font-bold">Verification Failed</h1>
            <p className="mt-4 text-muted-foreground">
              This link is invalid or has expired. Request a new one from settings.
            </p>
          </>
        )}
        <Link href={getDefaultPanelPath(user?.role)}>
          <Button className="mt-8 rounded-xl">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}

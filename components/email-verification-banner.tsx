"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EmailVerificationBannerProps {
  className?: string
  compact?: boolean
}

export function EmailVerificationBanner({
  className,
  compact = false,
}: EmailVerificationBannerProps) {
  const { user, refreshUser } = useAuth()
  const [sending, setSending] = useState(false)

  if (!user || user.isVerified) return null

  const handleResend = async () => {
    setSending(true)
    try {
      await api("/auth/resend-verification", { method: "POST" })
      toast.success("Verification email sent — check your inbox")
    } catch {
      toast.error("Failed to send verification email")
    } finally {
      setSending(false)
    }
  }

  return (
    <Alert
      className={cn(
        "border-yellow-500/30 bg-yellow-500/5",
        className,
      )}
    >
      <Mail className="size-4 text-yellow-600" />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription className="mt-1">
        {compact
          ? "Verify your email to enroll, pay, and subscribe."
          : "Please verify your email to enroll in courses, make payments, and subscribe to plans."}
      </AlertDescription>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={handleResend}
          disabled={sending}
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Resend Email"
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl"
          asChild
        >
          <Link href="/dashboard/settings">Go to Settings</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl"
          onClick={() => refreshUser()}
        >
          I&apos;ve verified
        </Button>
      </div>
    </Alert>
  )
}

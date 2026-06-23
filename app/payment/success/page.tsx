"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import type { PaymentStatusInfo } from "@fxprime/types"
import { useAuth } from "@/lib/auth-context"
import { getDefaultPanelPath, getOrdersPath } from "@/lib/get-default-panel"
import { buildLiveHubUrl } from "@/lib/live-session-intent"

function SuccessContent() {
  const { user, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get("paymentId")
  const sessionIdFromQuery = searchParams.get("sessionId")
  const [status, setStatus] = useState<PaymentStatusInfo | null>(null)
  const [polling, setPolling] = useState(!!paymentId)
  const [userRefreshed, setUserRefreshed] = useState(false)

  useEffect(() => {
    if (!paymentId) return
    let attempts = 0
    const poll = async () => {
      try {
        const data = await api<PaymentStatusInfo>(`/payments/${paymentId}/status`)
        setStatus(data)
        if (data.status === "COMPLETED" || attempts >= 10) {
          setPolling(false)
          return
        }
      } catch {
        setPolling(false)
      }
      attempts++
      setTimeout(poll, 2000)
    }
    poll()
  }, [paymentId])

  useEffect(() => {
    if (status?.status !== "COMPLETED" || userRefreshed) return
    void refreshUser().finally(() => setUserRefreshed(true))
  }, [status?.status, userRefreshed, refreshUser])

  const sessionId = sessionIdFromQuery || status?.sessionId
  const isSubscription = status?.type === "SUBSCRIPTION"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="mt-4 text-muted-foreground">
          {polling ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming payment...
            </span>
          ) : (
            <>
              {isSubscription && sessionId
                ? "PRO is active. Taking you to register for your session…"
                : isSubscription
                  ? "Your PRO subscription is now active. Live sessions are unlocked."
                  : "Your payment has been processed successfully."}
              {status && (
                <span className="mt-2 block text-xs">
                  {status.type.replace(/_/g, " ")} · {status.gateway} · {status.status}
                </span>
              )}
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {sessionId && !polling ? (
            <Button
              className="rounded-xl"
              onClick={() =>
                router.push(buildLiveHubUrl({ registerSession: sessionId, registered: true }))
              }
            >
              Go to live session
            </Button>
          ) : (
            <Button
              className="rounded-xl"
              onClick={() => router.push(getDefaultPanelPath(user?.role))}
            >
              Go to Dashboard
            </Button>
          )}
          <Link href={getOrdersPath(user?.role)}>
            <Button variant="outline" className="w-full rounded-xl">View Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { LiveSessionPlanCards } from "@/components/pricing/live-session-plan-cards"
import { SessionIntentBanner } from "@/components/pricing/session-intent-banner"
import { useSubscriptionPricing } from "@/hooks/use-subscription-pricing"
import { api } from "@/lib/api"
import type { LiveSessionPreview } from "@fxprime/types"

function PricingContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId")
  const [sessionPreview, setSessionPreview] = useState<LiveSessionPreview | null>(null)
  const [sessionLoading, setSessionLoading] = useState(!!sessionId)

  const {
    proPrice,
    subscription,
    loadingPlan,
    subscribeDisabled,
    hasProLiveAccess,
    handleSubscribePro,
    handleRegisterSession,
    registeringSession,
  } = useSubscriptionPricing({ sessionId })

  useEffect(() => {
    if (!sessionId) {
      setSessionPreview(null)
      setSessionLoading(false)
      return
    }
    setSessionLoading(true)
    api<LiveSessionPreview>(`/sessions/${sessionId}/preview`)
      .then(setSessionPreview)
      .catch(() => setSessionPreview(null))
      .finally(() => setSessionLoading(false))
  }, [sessionId])

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
          Live sessions
        </Badge>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Free webinars or PRO live sessions
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Start with free public webinars, or upgrade to PRO for exclusive
          Q&A, mock tests, and group sessions.
        </p>
        {subscription && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge>Current plan: {subscription.plan}</Badge>
            {subscription.status === "GRACE" && (
              <Badge variant="destructive">Grace period — renew now</Badge>
            )}
            {subscription.cancelAtPeriodEnd && (
              <Badge variant="outline">Cancels at period end</Badge>
            )}
          </div>
        )}
      </div>

      {sessionId && (
        <SessionIntentBanner
          session={sessionPreview}
          loading={sessionLoading}
          proUnlocked={hasProLiveAccess}
          registering={registeringSession}
          onRegister={handleRegisterSession}
        />
      )}

      <LiveSessionPlanCards
        proPrice={proPrice}
        subscription={subscription}
        loadingPlan={loadingPlan}
        subscribeDisabled={subscribeDisabled}
        onSubscribePro={handleSubscribePro}
      />

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Payment method is selected on the checkout step after you choose to upgrade.
      </p>
    </main>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading plans…
        </main>
      }
    >
      <PricingContent />
    </Suspense>
  )
}

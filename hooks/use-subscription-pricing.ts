"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { PlanOption, SubscriptionInfo } from "@fxprime/types"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { buildSubscriptionCheckoutUrl } from "@/lib/checkout-urls"
import { buildLiveHubUrl } from "@/lib/live-session-intent"
import { registerLiveSession } from "@/lib/register-live-session"
import { needsEmailVerification } from "@/lib/verification"

type UseSubscriptionPricingOptions = {
  sessionId?: string | null
  /** Override post-login return URL (e.g. homepage anchor) */
  loginRedirect?: string
}

export function useSubscriptionPricing(options: UseSubscriptionPricingOptions = {}) {
  const sessionId = options.sessionId ?? null
  const loginRedirect =
    options.loginRedirect ?? buildSubscriptionCheckoutUrl({ plan: "PRO", sessionId })
  const { user } = useAuth()
  const router = useRouter()
  const [proPrice, setProPrice] = useState(35)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [registeringSession, setRegisteringSession] = useState(false)

  useEffect(() => {
    api<PlanOption[]>("/subscription/plans")
      .then((plans) => {
        const pro = plans.find((p) => p.plan === "PRO")
        if (pro) setProPrice(pro.price)
      })
      .catch(console.error)

    if (user) {
      api<SubscriptionInfo>("/subscription/me").then(setSubscription).catch(() => {})
    } else {
      setSubscription(null)
    }
  }, [user])

  const subscribeDisabled = useMemo(() => needsEmailVerification(user), [user])

  const hasProLiveAccess = useMemo(() => {
    if (!subscription?.isActive) return false
    return subscription.plan === "PRO" || subscription.plan === "LIFETIME"
  }, [subscription])

  async function completeSessionRegistration() {
    if (!sessionId) return false
    setRegisteringSession(true)
    try {
      const result = await registerLiveSession(sessionId)
      if (result.ok) {
        toast.success("You're registered for the session!")
        router.push(buildLiveHubUrl({ registerSession: sessionId, registered: true }))
        return true
      }
      toast.error(result.message)
      if (result.redirectTo) router.push(result.redirectTo)
      return false
    } finally {
      setRegisteringSession(false)
    }
  }

  const handleSubscribePro = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(loginRedirect)}`)
      return
    }
    setLoadingPlan("PRO")
    router.push(buildSubscriptionCheckoutUrl({ plan: "PRO", sessionId }))
    setLoadingPlan(null)
  }

  return {
    proPrice,
    subscription,
    loadingPlan,
    subscribeDisabled,
    hasProLiveAccess,
    handleSubscribePro,
    handleRegisterSession: completeSessionRegistration,
    registeringSession,
  }
}

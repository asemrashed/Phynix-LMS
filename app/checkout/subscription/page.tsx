"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutPageContainer } from "@/components/checkout/checkout-page-container"
import { CheckoutShell } from "@/components/checkout/checkout-shell"
import { PaymentGatewayPicker } from "@/components/checkout/payment-gateway-picker"
import { PaymentUnavailableAlert } from "@/components/checkout/payment-unavailable-alert"
import { SessionCheckoutBanner } from "@/components/checkout/session-checkout-banner"
import { SubscriptionPlanSummary } from "@/components/checkout/subscription-plan-summary"
import { SubscriptionStatusBadges } from "@/components/checkout/subscription-status-badges"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { usePaymentConfig } from "@/hooks/use-payment-config"
import { api } from "@/lib/api"
import { buildPricingUrl } from "@/lib/live-session-intent"
import {
  createCheckoutPayment,
  formatGatewayAmount,
  isManualPaymentGateway,
  processPayment,
} from "@/lib/payment"
import { useAuth } from "@/lib/auth-context"
import { getSettingsPath } from "@/lib/get-default-panel"
import { handleVerificationError, needsEmailVerification } from "@/lib/verification"
import {
  getPlanSuccessMessage,
  getSubscriptionCheckoutBlock,
  isValidPaidPlan,
  resolvePaidPlan,
} from "@/lib/subscription-checkout"
import type { LiveSessionPreview, PlanOption, SubscriptionInfo } from "@fxprime/types"
import { toast } from "sonner"

function SubscriptionCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const planParam = searchParams.get("plan")
  const sessionId = searchParams.get("sessionId")
  const plan = resolvePaidPlan(planParam)

  const [planOption, setPlanOption] = useState<PlanOption | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [sessionPreview, setSessionPreview] = useState<LiveSessionPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const {
    config,
    loading: configLoading,
    error: configError,
    gateway,
    setGateway,
    availableGateways,
    allowUserChoice,
  } = usePaymentConfig()

  const checkoutBlock = useMemo(
    () => getSubscriptionCheckoutBlock(subscription, plan),
    [subscription, plan]
  )

  useEffect(() => {
    if (planParam && !isValidPaidPlan(planParam)) {
      toast.error("Invalid subscription plan")
      router.replace(buildPricingUrl(sessionId))
    }
  }, [planParam, router, sessionId])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      const redirect = `/checkout/subscription?${searchParams.toString()}`
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    setFetching(true)
    Promise.all([
      api<PlanOption[]>("/subscription/plans"),
      api<SubscriptionInfo>("/subscription/me").catch(() => null),
      sessionId
        ? api<LiveSessionPreview>(`/sessions/${sessionId}/preview`).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([plans, sub, preview]) => {
        const match = plans.find((p) => p.plan === plan) ?? null
        setPlanOption(match)
        setSubscription(sub)
        setSessionPreview(preview)
      })
      .finally(() => setFetching(false))
  }, [authLoading, user, plan, sessionId, router, searchParams])

  const handlePay = async () => {
    if (checkoutBlock.blocked || availableGateways.length === 0 || planOption?.price == null) return
    setLoading(true)
    try {
      const result = await createCheckoutPayment({
        type: "subscription",
        plan,
        gateway,
        sessionId: sessionId ?? undefined,
      })
      const redirected = await processPayment(result)
      if (redirected) return

      toast.success(getPlanSuccessMessage(plan))
      if (sessionId) {
        router.push(`/live?registerSession=${sessionId}&registered=1`)
      } else {
        router.push(buildPricingUrl())
      }
    } catch (err) {
      if (
        handleVerificationError(err, () => {
          toast.error("Verify your email before subscribing")
          router.push(getSettingsPath(user?.role))
        })
      ) {
        return
      }
      toast.error("Subscription failed")
    } finally {
      setLoading(false)
    }
  }

  const showLoading = authLoading || fetching || configLoading
  const price = planOption?.price ?? null
  const priceCurrency = planOption?.currency ?? "BDT"
  const paymentsUnavailable = configError || availableGateways.length === 0

  if (showLoading) {
    return (
      <CheckoutShell>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CheckoutShell>
    )
  }

  return (
    <CheckoutShell>
      <CheckoutPageContainer>
        <Button variant="ghost" className="mb-6 rounded-xl" asChild>
          <Link href={buildPricingUrl(sessionId)}>← Back to plans</Link>
        </Button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Complete your upgrade</h1>
          <p className="max-w-2xl text-muted-foreground">
            Review your plan, then choose a payment method to activate your subscription.
          </p>
          {subscription && (
            <div className="mt-4">
              <SubscriptionStatusBadges subscription={subscription} />
            </div>
          )}
        </div>

        <EmailVerificationBanner className="mb-6" compact />

        {checkoutBlock.blocked ? (
          <Card className="max-w-2xl rounded-[20px] border-primary/20">
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground">{checkoutBlock.message}</p>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-xl" asChild>
                  <Link href={buildPricingUrl(sessionId)}>View plans</Link>
                </Button>
                {sessionId && (
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link href={`/live?registerSession=${sessionId}`}>Go to session</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {sessionPreview && <SessionCheckoutBanner session={sessionPreview} />}
              <SubscriptionPlanSummary plan={plan} planOption={planOption} />
              <p className="text-xs leading-relaxed text-muted-foreground">
                By completing payment you agree to our{" "}
                <Link href="/terms" className="underline hover:text-primary">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/refund-policy" className="underline hover:text-primary">
                  Refund Policy
                </Link>
                . IELTS preparation content only — not official exam advice.
              </p>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 rounded-[20px]">
                <CardHeader>
                  <CardTitle className="text-lg">Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {checkoutBlock.isRenewal && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                      {checkoutBlock.message}
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <Badge variant="secondary" className="rounded-lg">
                        {plan}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">
                        {plan === "LIFETIME" ? "One-time" : "Monthly"}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {price != null ? formatGatewayAmount(price, gateway, priceCurrency) : "—"}
                        {plan !== "LIFETIME" && price != null && (
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {plan !== "LIFETIME" && (
                    <p className="text-xs text-muted-foreground">
                      PRO access activates immediately after payment. Renews monthly unless cancelled.
                    </p>
                  )}

                  {paymentsUnavailable ? (
                    <PaymentUnavailableAlert configError={configError} />
                  ) : (
                    config && (
                      <PaymentGatewayPicker
                        gateways={config.gateways}
                        value={gateway}
                        onChange={setGateway}
                        allowUserChoice={allowUserChoice}
                      />
                    )
                  )}

                  <Button
                    className="w-full rounded-xl"
                    size="lg"
                    onClick={handlePay}
                    disabled={
                      loading ||
                      needsEmailVerification(user) ||
                      paymentsUnavailable ||
                      price == null
                    }
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : checkoutBlock.isRenewal ? (
                      isManualPaymentGateway(gateway) ? (
                        `Continue to ${gateway === "bkash" ? "bKash" : "Nagad"} payment`
                      ) : (
                        `Renew for ${price != null ? formatGatewayAmount(price, gateway, priceCurrency) : ""}`
                      )
                    ) : isManualPaymentGateway(gateway) ? (
                      `Continue to ${gateway === "bkash" ? "bKash" : "Nagad"} payment`
                    ) : (
                      `Pay ${price != null ? formatGatewayAmount(price, gateway, priceCurrency) : ""}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CheckoutPageContainer>
    </CheckoutShell>
  )
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense
      fallback={
        <CheckoutShell>
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CheckoutShell>
      }
    >
      <SubscriptionCheckoutContent />
    </Suspense>
  )
}

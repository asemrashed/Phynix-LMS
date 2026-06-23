"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { CourseDetail, InstallmentPlanItem, PaymentSessionResponse } from "@fxprime/types"
import { api } from "@/lib/api"
import {
  formatGatewayAmount,
  isManualPaymentGateway,
  processPayment,
} from "@/lib/payment"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { handleVerificationError, needsEmailVerification } from "@/lib/verification"
import { getSettingsPath } from "@/lib/get-default-panel"
import { PaymentGatewayPicker } from "@/components/checkout/payment-gateway-picker"
import { usePaymentConfig } from "@/hooks/use-payment-config"
import { Loader2 } from "lucide-react"

function CheckoutContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = searchParams.get("courseId")
  const devPaymentId = searchParams.get("paymentId")
  const isDevCheckout = searchParams.get("dev") === "1"
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlanItem[]>([])
  const [payMode, setPayMode] = useState<"full" | "installment">("full")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const { config, loading: configLoading, gateway, setGateway, availableGateways, allowUserChoice } =
    usePaymentConfig()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [devSimulating, setDevSimulating] = useState(false)

  useEffect(() => {
    if (!isDevCheckout || !devPaymentId || !user) return

    let cancelled = false
    async function completeDevPayment() {
      setDevSimulating(true)
      setLoading(true)
      try {
        await api(`/payments/simulate/${devPaymentId}`, { method: "POST" })
        if (cancelled) return
        toast.success("Payment successful! You are now enrolled.")
        router.replace(`/payment/success?paymentId=${devPaymentId}`)
      } catch (err) {
        if (cancelled) return
        if (
          handleVerificationError(err, () => {
            toast.error("Verify your email before completing payment")
            router.push(getSettingsPath(user?.role))
          })
        ) {
          return
        }
        toast.error("Dev payment simulation failed")
        router.replace("/payment/fail")
      } finally {
        if (!cancelled) {
          setLoading(false)
          setDevSimulating(false)
        }
      }
    }

    completeDevPayment()
    return () => {
      cancelled = true
    }
  }, [isDevCheckout, devPaymentId, user, router])

  useEffect(() => {
    if (!courseId) {
      if (isDevCheckout && devPaymentId) {
        setFetching(false)
      }
      return
    }
    async function fetchCourse() {
      try {
        const courses = await api<{ courses: CourseDetail[] }>("/courses")
        const found = courses.courses.find((c) => c.id === courseId)
        if (found) {
          const [detail, plans] = await Promise.all([
            api<CourseDetail>(`/courses/${found.slug}`),
            api<InstallmentPlanItem[]>(`/payments/installments/plans/${courseId}`).catch(
              () => [] as InstallmentPlanItem[]
            ),
          ])
          setCourse(detail)
          setInstallmentPlans(plans)
          if (plans[0]) setSelectedPlanId(plans[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchCourse()
  }, [courseId, isDevCheckout, devPaymentId])

  const selectedPlan = installmentPlans.find((plan) => plan.id === selectedPlanId)
  const displayAmount =
    payMode === "installment" && selectedPlan
      ? Math.round((selectedPlan.totalAmount * selectedPlan.downPaymentPercent) / 100)
      : course?.price ?? 0

  const handlePayment = async () => {
    if (!courseId || availableGateways.length === 0) return
    setLoading(true)
    try {
      if (payMode === "installment" && selectedPlanId) {
        const result = await api<{
          checkoutUrl: string
          paymentId?: string
          manual?: boolean
          gateway?: string
        }>("/payments/installments/agreement", {
          method: "POST",
          body: JSON.stringify({
            courseId,
            planId: selectedPlanId,
            gateway,
          }),
        })

        await processPayment({
          paymentId: result.paymentId,
          checkoutUrl: result.checkoutUrl,
          manual: result.manual,
          gateway: result.gateway as PaymentSessionResponse["gateway"],
        })
        return
      }

      const session = await api<PaymentSessionResponse>("/payments/create-session", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          gateway,
        }),
      })

      if (session.manual || isManualPaymentGateway(session.gateway)) {
        await processPayment({
          sessionId: session.sessionId,
          paymentId: session.paymentId,
          checkoutUrl: session.checkoutUrl,
          manual: true,
          gateway: session.gateway,
        })
        return
      }

      await processPayment({
        sessionId: session.sessionId,
        paymentId: session.paymentId,
        checkoutUrl: session.checkoutUrl,
        gateway: session.gateway,
      })
      toast.success("Payment successful! You are now enrolled.")
      router.push(`/courses/${course?.slug}`)
    } catch (err) {
      if (
        handleVerificationError(err, () => {
          toast.error("Verify your email before making a payment")
          router.push(getSettingsPath(user?.role))
        })
      ) {
        return
      }
      toast.error("Payment failed. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (fetching || devSimulating || configLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {devSimulating && (
          <p className="text-sm text-muted-foreground">Completing dev payment...</p>
        )}
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p>{isDevCheckout ? "Processing payment..." : "Course not found"}</p>
        {!isDevCheckout && (
          <Button className="mt-4 rounded-xl" onClick={() => router.push("/courses")}>
            Browse Courses
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Checkout</h1>

      <EmailVerificationBanner className="mb-6" compact />

      <Card className="rounded-[20px]">
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {installmentPlans.length > 0 && (
            <div className="space-y-3">
              <Label>Payment option</Label>
              <RadioGroup
                value={payMode}
                onValueChange={(value) => setPayMode(value as "full" | "installment")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-xl border border-border p-3">
                  <RadioGroupItem value="full" id="pay-full" />
                  <Label htmlFor="pay-full" className="cursor-pointer">
                    Pay full amount — {formatGatewayAmount(course.price, gateway, course.currency)}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-xl border border-border p-3">
                  <RadioGroupItem value="installment" id="pay-installment" />
                  <Label htmlFor="pay-installment" className="cursor-pointer">
                    Pay in installments
                  </Label>
                </div>
              </RadioGroup>

              {payMode === "installment" && (
                <RadioGroup
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                  className="space-y-2 pl-1"
                >
                  {installmentPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center space-x-3 rounded-xl border border-border p-3"
                    >
                      <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                      <Label htmlFor={`plan-${plan.id}`} className="cursor-pointer text-sm">
                        {plan.label} — {plan.installmentCount} payments, down{" "}
                        {plan.downPaymentPercent}% (
                        {formatGatewayAmount(
                          Math.round((plan.totalAmount * plan.downPaymentPercent) / 100),
                          gateway,
                          course.currency
                        )}
                        )
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">
              {payMode === "installment" ? "Due now" : "Total"}
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatGatewayAmount(displayAmount, gateway, course.currency)}
            </span>
          </div>

          {config && (
            <PaymentGatewayPicker
              gateways={config.gateways}
              value={gateway}
              onChange={setGateway}
              allowUserChoice={allowUserChoice}
            />
          )}

          <Button
            className="w-full rounded-xl"
            onClick={handlePayment}
            disabled={loading || needsEmailVerification(user) || availableGateways.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isManualPaymentGateway(gateway) ? (
              `Continue to ${gateway === "bkash" ? "bKash" : "Nagad"} payment`
            ) : (
              `Pay ${formatGatewayAmount(displayAmount, gateway, course.currency)}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}

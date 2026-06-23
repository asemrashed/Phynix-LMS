"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ManualPaymentFlow } from "@/components/checkout/manual-payment-flow"
import { CheckoutPageContainer } from "@/components/checkout/checkout-page-container"
import { CheckoutShell } from "@/components/checkout/checkout-shell"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

function ManualCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const paymentId = searchParams.get("paymentId")

  useEffect(() => {
    if (authLoading || !paymentId) return
    if (!user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/checkout/manual?paymentId=${paymentId}`)}`
      )
    }
  }, [authLoading, user, paymentId, router])

  if (!paymentId) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="py-16 text-center">
          <p className="text-muted-foreground">Missing payment ID</p>
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  if (authLoading || !user) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  return (
    <CheckoutShell>
      <CheckoutPageContainer>
        <ManualPaymentFlow paymentId={paymentId} />
      </CheckoutPageContainer>
    </CheckoutShell>
  )
}

export default function ManualCheckoutPage() {
  return (
    <Suspense
      fallback={
        <CheckoutShell>
          <CheckoutPageContainer className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CheckoutPageContainer>
        </CheckoutShell>
      }
    >
      <ManualCheckoutContent />
    </Suspense>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatGatewayAmount, isManualPaymentGateway, processPayment } from "@/lib/payment"
import type { InstallmentAgreementItem, PaymentGateway } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentGatewayPicker } from "@/components/checkout/payment-gateway-picker"
import { usePaymentConfig } from "@/hooks/use-payment-config"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function InstallmentsPage() {
  const [agreements, setAgreements] = useState<InstallmentAgreementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const { config, gateway, setGateway, allowUserChoice } = usePaymentConfig()

  const load = () => {
    setLoading(true)
    api<InstallmentAgreementItem[]>("/payments/installments/my")
      .then(setAgreements)
      .catch(() => toast.error("Failed to load installments"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const payInstallment = async (installmentPaymentId: string) => {
    setPayingId(installmentPaymentId)
    try {
      const result = await api<{
        checkoutUrl: string
        paymentId?: string
        manual?: boolean
        gateway?: PaymentGateway
      }>(`/payments/installments/${installmentPaymentId}/pay`, {
        method: "POST",
        body: JSON.stringify({ gateway }),
      })

      await processPayment({
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl,
        manual: result.manual,
        gateway: result.gateway,
      })
    } catch {
      toast.error("Could not start installment payment")
    } finally {
      setPayingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Installments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your payment plans and pay upcoming installments.
        </p>
      </div>

      {config && agreements.some((a) => a.status === "ACTIVE" || a.status === "DEFAULTED") && (
        <Card className="rounded-[20px]">
          <CardHeader>
            <CardTitle className="text-lg">Preferred payment method</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentGatewayPicker
              gateways={config.gateways}
              value={gateway}
              onChange={setGateway}
              allowUserChoice={allowUserChoice}
            />
          </CardContent>
        </Card>
      )}

      {agreements.length === 0 ? (
        <Card className="rounded-[20px]">
          <CardContent className="py-10 text-center text-muted-foreground">
            No installment plans yet. Choose installment checkout on a course to get started.
          </CardContent>
        </Card>
      ) : (
        agreements.map((agreement) => (
          <Card key={agreement.id} className="rounded-[20px]">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{agreement.courseTitle}</CardTitle>
                <Badge variant="outline">{agreement.planLabel}</Badge>
                <Badge>{agreement.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Paid {formatGatewayAmount(agreement.paidAmount, "bkash", "BDT")} of{" "}
                {formatGatewayAmount(agreement.totalAmount, "bkash", "BDT")}
              </p>
              {agreement.accessSuspendedAt && (
                <p className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Course access is suspended until overdue installments are paid.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {agreement.installments.map((item) => {
                const canPay =
                  ["PENDING", "OVERDUE", "AWAITING_VERIFICATION"].includes(item.status) &&
                  agreement.status !== "COMPLETED"
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        Installment {item.installmentNo} — {formatGatewayAmount(item.amount, "bkash", "BDT")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due {new Date(item.dueDate).toLocaleDateString()} · {item.status}
                      </p>
                    </div>
                    {canPay ? (
                      <Button
                        size="sm"
                        className="rounded-xl"
                        disabled={payingId === item.id}
                        onClick={() => payInstallment(item.id)}
                      >
                        {payingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isManualPaymentGateway(gateway) ? (
                          `Pay via ${gateway}`
                        ) : (
                          "Pay now"
                        )}
                      </Button>
                    ) : item.status === "PAID" ? (
                      <Badge variant="secondary">Paid</Badge>
                    ) : item.paymentId ? (
                      <Button size="sm" variant="outline" className="rounded-xl" asChild>
                        <Link href={`/checkout/manual?paymentId=${item.paymentId}`}>View payment</Link>
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

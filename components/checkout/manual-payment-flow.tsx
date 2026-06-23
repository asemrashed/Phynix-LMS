"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  Copy,
  ImagePlus,
  Loader2,
  Smartphone,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatGatewayAmount } from "@/lib/payment"
import { ApiError } from "@/lib/api"
import { fetchManualPaymentDetails, submitManualPaymentProof } from "@/lib/payment"
import { uploadManualPaymentProof } from "@/lib/upload"
import { useAuth } from "@/lib/auth-context"
import { getDefaultPanelPath, getOrdersPath } from "@/lib/get-default-panel"
import type { ManualPaymentDetails, PaymentStatus } from "@fxprime/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ManualPaymentFlowProps {
  paymentId: string
  onSubmitted?: () => void
}

const flowContainerClass = "mx-auto w-full max-w-7xl"
const flowContentClass = "mx-auto w-full max-w-3xl"

function gatewayLabel(gateway: ManualPaymentDetails["gateway"]) {
  return gateway === "bkash" ? "bKash" : "Nagad"
}

function getPageTitle(details: ManualPaymentDetails) {
  switch (details.status) {
    case "COMPLETED":
      return "Payment complete"
    case "AWAITING_VERIFICATION":
      return "Verification in progress"
    case "REJECTED":
      return "Payment not approved"
    case "EXPIRED":
      return "Payment expired"
    default:
      return `Pay with ${gatewayLabel(details.gateway)}`
  }
}

function ManualPaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="rounded-lg border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
          Approved
        </Badge>
      )
    case "AWAITING_VERIFICATION":
      return (
        <Badge className="rounded-lg border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300">
          Under review
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge variant="destructive" className="rounded-lg">
          Rejected
        </Badge>
      )
    case "EXPIRED":
      return (
        <Badge variant="secondary" className="rounded-lg">
          Expired
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="rounded-lg">
          {status.replaceAll("_", " ")}
        </Badge>
      )
  }
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function ManualPaymentLoadingSkeleton() {
  return (
    <div className={cn(flowContainerClass, "animate-pulse space-y-8")}>
      <div className={flowContentClass}>
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted" />
        <div className="h-4 w-40 rounded-lg bg-muted" />
      </div>
      <div className="h-72 rounded-[20px] bg-muted" />
      </div>
    </div>
  )
}

function ManualPaymentActions({
  primaryLabel = "Go to Dashboard",
  primaryHref,
}: {
  primaryLabel?: string
  primaryHref?: string
}) {
  const { user } = useAuth()
  const router = useRouter()
  const dashboardPath = primaryHref ?? getDefaultPanelPath(user?.role)
  const ordersPath = getOrdersPath(user?.role)

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
      <Button className="w-full rounded-xl" onClick={() => router.push(dashboardPath)}>
        {primaryLabel}
      </Button>
      <Button variant="outline" className="w-full rounded-xl" asChild>
        <Link href={ordersPath} className="w-full">
          View orders
        </Link>
      </Button>
    </div>
  )
}

export function ManualPaymentFlow({ paymentId, onSubmitted }: ManualPaymentFlowProps) {
  const [details, setDetails] = useState<ManualPaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [senderNumber, setSenderNumber] = useState("")
  const [customerTrxId, setCustomerTrxId] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchManualPaymentDetails(paymentId)
      .then(setDetails)
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            toast.error("Please log in to view this payment")
            return
          }
          toast.error(err.message || "Could not load payment details")
          return
        }
        toast.error("Could not load payment details")
      })
      .finally(() => setLoading(false))
  }, [paymentId])

  useEffect(() => {
    if (details?.status !== "AWAITING_VERIFICATION") return

    const interval = setInterval(() => {
      fetchManualPaymentDetails(paymentId)
        .then(setDetails)
        .catch(() => {})
    }, 10000)

    return () => clearInterval(interval)
  }, [paymentId, details?.status])

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview)
    }
  }, [proofPreview])

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  }

  const handleProofSelect = (file: File | null) => {
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(file)
    setProofPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async () => {
    if (!senderNumber.trim() || !customerTrxId.trim()) {
      toast.error("Enter sender number and transaction ID")
      return
    }

    setSubmitting(true)
    try {
      let proofUrl: string | undefined
      if (proofFile) {
        const uploaded = await uploadManualPaymentProof(paymentId, proofFile)
        proofUrl = uploaded.url
      }

      const updated = await submitManualPaymentProof(paymentId, {
        senderNumber: senderNumber.trim(),
        customerTrxId: customerTrxId.trim(),
        proofUrl,
      })
      setDetails(updated)
      toast.success("Payment proof submitted. Admin will verify shortly.")
      onSubmitted?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <ManualPaymentLoadingSkeleton />
  }

  if (!details) {
    return (
      <div className={flowContainerClass}>
        <p className="py-16 text-center text-muted-foreground">Payment not found</p>
      </div>
    )
  }

  const awaiting = details.status === "AWAITING_VERIFICATION"
  const completed = details.status === "COMPLETED"
  const rejected = details.status === "REJECTED"
  const expired = details.status === "EXPIRED"
  const gatewayName = gatewayLabel(details.gateway)
  const formattedAmount = formatGatewayAmount(
    details.amount,
    details.gateway,
    details.currency
  )

  if (completed) {
    return (
      <div className={flowContainerClass}>
        <div className={cn(flowContentClass, "text-center")}>
          <CheckCircle2
            className="mx-auto h-14 w-14 text-green-600"
            aria-hidden
          />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Payment approved</h1>
          <p className="mt-2 text-muted-foreground">
            {details.entityLabel} is now active.
          </p>

          <Card className="mt-8 rounded-[20px] text-left">
            <CardContent className="space-y-3 pt-6">
              <ReceiptRow label="Amount" value={formattedAmount} />
              <ReceiptRow label="Gateway" value={gatewayName} />
              <ReceiptRow label="Reference" value={details.referenceCode} />
              {details.customerTrxId && (
                <ReceiptRow label="Transaction ID" value={details.customerTrxId} />
              )}
              {details.submittedAt && (
                <ReceiptRow
                  label="Submitted"
                  value={new Date(details.submittedAt).toLocaleString()}
                />
              )}
            </CardContent>
            <CardFooter className="flex w-full flex-col items-stretch gap-3 border-t pt-6">
              <ManualPaymentActions />
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={flowContainerClass}>
      <div className={cn(flowContentClass, "space-y-8")}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getPageTitle(details)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{details.entityLabel}</p>
        </div>

        <Card className="rounded-[20px]">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            {formattedAmount}
            <ManualPaymentStatusBadge status={details.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!awaiting && !expired && !rejected && (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Step 1 — Send exact amount</p>
                <p className="mt-2 text-2xl font-bold text-primary">{formattedAmount}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Send to{" "}
                  <span className="font-medium text-foreground">
                    {details.merchantName || details.gateway.toUpperCase()}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="rounded-lg bg-background px-3 py-2 text-sm">
                    {details.merchantNumber}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => copyText(details.merchantNumber, "Number")}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Reference: {details.referenceCode}</Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => copyText(details.referenceCode, "Reference")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {details.instructions && (
                  <p className="mt-3 text-sm text-muted-foreground">{details.instructions}</p>
                )}
              </div>

              {details.qrImageUrl && (
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="mb-3 text-sm font-medium">Scan QR code</p>
                  <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-xl border border-border">
                    <Image
                      src={details.qrImageUrl}
                      alt={`${details.gateway} QR code`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 rounded-xl border border-border p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Smartphone className="h-4 w-4" />
                  Step 2 — Submit payment proof
                </p>
                <div>
                  <Label htmlFor="senderNumber">Your {details.gateway} number</Label>
                  <Input
                    id="senderNumber"
                    className="mt-1 rounded-xl"
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerTrxId">Transaction ID</Label>
                  <Input
                    id="customerTrxId"
                    className="mt-1 rounded-xl"
                    placeholder="e.g. 8N90ABCD"
                    value={customerTrxId}
                    onChange={(e) => setCustomerTrxId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="proofScreenshot">Payment screenshot (optional)</Label>
                  <input
                    ref={fileInputRef}
                    id="proofScreenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleProofSelect(e.target.files?.[0] ?? null)}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      {proofFile ? "Change screenshot" : "Upload screenshot"}
                    </Button>
                    {proofFile && (
                      <span className="text-sm text-muted-foreground">{proofFile.name}</span>
                    )}
                  </div>
                  {proofPreview && (
                    <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl border border-border">
                      <Image
                        src={proofPreview}
                        alt="Payment screenshot preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
                <Button
                  className="w-full rounded-xl"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for verification"
                  )}
                </Button>
              </div>
            </>
          )}

          {awaiting && (
            <div
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm"
              role="status"
              aria-live="polite"
            >
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                <div>
                  <p className="font-medium text-foreground">Waiting for admin verification</p>
                  <p className="mt-1 text-muted-foreground">
                    Trx ID {details.customerTrxId} from {details.senderNumber} was submitted
                    {details.submittedAt
                      ? ` on ${new Date(details.submittedAt).toLocaleString()}`
                      : ""}
                    .
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    This page refreshes automatically every 10 seconds.
                  </p>
                </div>
              </div>
              {details.proofUrl && (
                <div className="relative mt-4 h-40 w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={details.proofUrl}
                    alt="Submitted payment proof"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}

          {rejected && (
            <div
              className={cn("rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm")}
              role="status"
            >
              <div className="flex gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
                <div>
                  <p className="font-medium text-foreground">Payment rejected</p>
                  <p className="mt-1 text-muted-foreground">
                    {details.rejectReason ||
                      "Please check your transaction details and try again."}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <ManualPaymentActions primaryLabel="Back to dashboard" />
              </div>
            </div>
          )}

          {expired && (
            <div className="space-y-5 rounded-xl border border-border bg-muted/40 p-5 text-sm">
              <p className="text-muted-foreground">
                This payment request expired. Please start checkout again from your cart or
                subscription page.
              </p>
              <ManualPaymentActions primaryLabel="Go to dashboard" />
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { api } from "./api"
import type {
  CreateGenericPaymentRequest,
  ManualPaymentDetails,
  PaymentConfigResponse,
  PaymentGateway,
  SubmitManualPaymentProofRequest,
} from "@fxprime/types"
export {
  formatGatewayAmount,
  getGatewayCurrency,
  resolveDisplayAmount,
} from "./currency"

export interface PaymentResult {
  paymentId?: string
  sessionId?: string
  checkoutUrl: string
  requiresPayment?: boolean
  manual?: boolean
  gateway?: PaymentGateway
}

export function isManualPaymentGateway(gateway: string): boolean {
  return gateway === "bkash" || gateway === "nagad"
}

export function isManualCheckoutUrl(url: string): boolean {
  return url.includes("/checkout/manual")
}

export function isSSLCommerzUrl(url: string): boolean {
  return url.includes("sslcommerz.com")
}

export function isExternalPaymentUrl(url: string): boolean {
  return url.includes("sslcommerz.com")
}

/** True when checkout leaves the current page (external gateway or manual flow). */
export function paymentRedirectsAway(result: PaymentResult): boolean {
  return (
    Boolean(result.manual) ||
    isManualPaymentGateway(result.gateway || "") ||
    isManualCheckoutUrl(result.checkoutUrl) ||
    isExternalPaymentUrl(result.checkoutUrl)
  )
}

export async function fetchPaymentConfig() {
  return api<PaymentConfigResponse>("/payments/config")
}

export async function processPayment(result: PaymentResult): Promise<boolean> {
  if (paymentRedirectsAway(result)) {
    window.location.href = result.checkoutUrl
    return true
  }

  const paymentId = result.paymentId || result.sessionId
  if (paymentId) {
    await api(`/payments/simulate/${paymentId}`, { method: "POST" })
    return true
  }

  return false
}

export async function createCheckoutPayment(body: CreateGenericPaymentRequest) {
  return api<PaymentResult>("/payments/sslcommerz/create", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function fetchManualPaymentDetails(paymentId: string) {
  return api<ManualPaymentDetails>(`/payments/manual/${paymentId}`)
}

export async function submitManualPaymentProof(
  paymentId: string,
  body: SubmitManualPaymentProofRequest
) {
  return api<ManualPaymentDetails>(`/payments/manual/${paymentId}/submit-proof`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** @deprecated Use createCheckoutPayment */
export async function createSSLPayment(body: Record<string, unknown>) {
  return createCheckoutPayment(body as CreateGenericPaymentRequest)
}

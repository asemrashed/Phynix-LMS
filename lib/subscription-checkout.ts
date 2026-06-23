import type { PlanType, SubscriptionInfo } from "@fxprime/types"

export const PAID_PLANS = ["BASIC", "PRO", "LIFETIME"] as const
export type PaidPlan = (typeof PAID_PLANS)[number]

export function isValidPaidPlan(value: string | null): value is PaidPlan {
  return !!value && PAID_PLANS.includes(value as PaidPlan)
}

export function resolvePaidPlan(value: string | null): PaidPlan {
  return isValidPaidPlan(value) ? value : "PRO"
}

export function hasProLiveAccess(subscription: SubscriptionInfo | null): boolean {
  if (!subscription?.isActive) return false
  return subscription.plan === "PRO" || subscription.plan === "LIFETIME"
}

export function getSubscriptionCheckoutBlock(
  subscription: SubscriptionInfo | null,
  plan: PaidPlan
): { blocked: boolean; isRenewal: boolean; message: string } {
  if (!subscription?.isActive) {
    return { blocked: false, isRenewal: false, message: "" }
  }

  if (subscription.plan === "LIFETIME") {
    return {
      blocked: true,
      isRenewal: false,
      message: "Your Lifetime plan already includes full access.",
    }
  }

  if (subscription.plan === "PRO" && (plan === "PRO" || plan === "BASIC")) {
    if (subscription.canRenew) {
      return {
        blocked: false,
        isRenewal: true,
        message: "Renew your PRO plan before it expires.",
      }
    }
    return {
      blocked: true,
      isRenewal: false,
      message: "PRO access is already active on your account.",
    }
  }

  return { blocked: false, isRenewal: false, message: "" }
}

export function getPlanSuccessMessage(plan: Exclude<PlanType, "FREE">): string {
  switch (plan) {
    case "BASIC":
      return "Basic plan activated!"
    case "LIFETIME":
      return "Lifetime plan activated — full access unlocked!"
    default:
      return "PRO plan activated — live sessions unlocked!"
  }
}

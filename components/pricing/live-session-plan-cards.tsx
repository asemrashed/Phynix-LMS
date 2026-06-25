"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SubscriptionInfo } from "@fxprime/types"
import { Check, Loader2, Radio, Sparkles, Video } from "lucide-react"
import { cn } from "@/lib/utils"

export type LiveSessionPlanCard = {
  id: "free" | "pro"
  title: string
  subtitle: string
  price: string
  priceNote?: string
  badge: string
  description: string
  features: string[]
  popular?: boolean
}

export const LIVE_SESSION_PLANS: LiveSessionPlanCard[] = [
  {
    id: "free",
    title: "Free live webinars",
    subtitle: "Community & intro sessions",
    price: "Free",
    priceNote: "with account",
    badge: "FREE",
    description:
      "Join public webinars — perfect for getting started and exploring PhynixEducation.",
    features: [
      "Public webinars on /live",
      "Register with a free account",
      "Join when the session goes live",
      "Community events & market intros",
    ],
  },
  {
    id: "pro",
    title: "PRO live sessions",
    subtitle: "Exclusive live learning",
    price: "৳3,850",
    priceNote: "/month",
    badge: "PRO & Lifetime",
    description:
      "Unlock interactive Q&A, group mentorship, and deep-dive sessions reserved for PRO members.",
    features: [
      "Interactive Q&A sessions",
      "Small-group mentorship",
      "Premium blog access included",
      "Priority support",
    ],
    popular: true,
  },
]

type LiveSessionPlanCardsProps = {
  proPrice?: number
  subscription: SubscriptionInfo | null
  loadingPlan: string | null
  subscribeDisabled: boolean
  onSubscribePro: () => void
}

function hasProLiveAccess(subscription: SubscriptionInfo | null): boolean {
  if (!subscription?.isActive) return false
  return subscription.plan === "PRO" || subscription.plan === "LIFETIME"
}

export function LiveSessionPlanCards({
  proPrice = 3850,
  subscription,
  loadingPlan,
  subscribeDisabled,
  onSubscribePro,
}: LiveSessionPlanCardsProps) {
  const proUnlocked = hasProLiveAccess(subscription)
  const isProCurrent = subscription?.plan === "PRO" && subscription?.isActive
  const showRenew = subscription?.plan === "PRO" && subscription?.canRenew

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      {LIVE_SESSION_PLANS.map((plan) => {
        const isPro = plan.id === "pro"
        const displayPrice = isPro ? `৳${proPrice.toLocaleString()}` : plan.price

        return (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-[24px] border bg-card p-8 shadow-sm transition-shadow",
              isPro
                ? "border-primary/40 shadow-md ring-2 ring-primary/20"
                : "border-border hover:shadow-md"
            )}
          >
            {plan.popular && (
              <Badge className="absolute right-6 top-6 rounded-full px-3">
                Most Popular
              </Badge>
            )}

            <div
              className={cn(
                "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                isPro ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {isPro ? <Sparkles className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </div>

            <div className="mb-4 space-y-2">
              <Badge variant={isPro ? "default" : "secondary"} className="rounded-lg">
                {plan.badge}
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">{plan.title}</h2>
              <p className="text-sm font-medium text-primary">{plan.subtitle}</p>
            </div>

            <div className="mb-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-primary">
                {displayPrice}
              </span>
              {plan.priceNote && (
                <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
              )}
            </div>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {plan.description}
            </p>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      isPro ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {isPro ? (
              <Button
                className="w-full rounded-xl"
                size="lg"
                variant={proUnlocked && !showRenew ? "outline" : "default"}
                disabled={
                  (proUnlocked && !showRenew) ||
                  loadingPlan === "PRO" ||
                  subscribeDisabled
                }
                onClick={onSubscribePro}
              >
                {loadingPlan === "PRO" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : showRenew ? (
                  "Renew PRO"
                ) : proUnlocked ? (
                  "PRO access active"
                ) : (
                  "Upgrade to PRO"
                )}
              </Button>
            ) : (
              <Button className="w-full rounded-xl" size="lg" variant="outline" asChild>
                <Link href="/live">
                  <Radio className="mr-2 h-4 w-4" />
                  Browse live classes
                </Link>
              </Button>
            )}

            {isPro && proUnlocked && subscription?.plan === "LIFETIME" && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Included with your Lifetime plan
              </p>
            )}

            {isProCurrent && subscription?.expiresAt && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}

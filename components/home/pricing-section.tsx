"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/home/section-header"
import { LandingContainer } from "@/components/home/landing-container"
import { LiveSessionPlanCards } from "@/components/pricing/live-session-plan-cards"
import { useSubscriptionPricing } from "@/hooks/use-subscription-pricing"
import type { PublicHomepageSection } from "@fxprime/types"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

interface PricingSectionProps {
  section?: PublicHomepageSection | null
}

export function PricingSection({ section }: PricingSectionProps) {
  const content = mergeHomepageSection("pricing", section)
  const footnote =
    (content.metadata?.footnote as string | undefined) ??
    "Payment method is selected on the checkout step after you choose to upgrade."

  const { proPrice, subscription, loadingPlan, subscribeDisabled, handleSubscribePro } =
    useSubscriptionPricing({ loginRedirect: "/#pricing" })

  return (
    <section className="py-20" id="pricing">
      <LandingContainer>
        <SectionHeader
          eyebrow={content.eyebrow ?? undefined}
          title={content.title ?? "Free webinars or PRO live sessions"}
          description={content.description ?? undefined}
        />

        {subscription && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <Badge>Current plan: {subscription.plan}</Badge>
            {subscription.status === "GRACE" && (
              <Badge variant="destructive">Grace period — renew now</Badge>
            )}
            {subscription.cancelAtPeriodEnd && (
              <Badge variant="outline">Cancels at period end</Badge>
            )}
          </div>
        )}

        <LiveSessionPlanCards
          proPrice={proPrice}
          subscription={subscription}
          loadingPlan={loadingPlan}
          subscribeDisabled={subscribeDisabled}
          onSubscribePro={handleSubscribePro}
        />

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-center text-xs text-muted-foreground">{footnote}</p>
          {content.ctaPrimary && (
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link href={content.ctaPrimary.href}>
                {content.ctaPrimary.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </LandingContainer>
    </section>
  )
}

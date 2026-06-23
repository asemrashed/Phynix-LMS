import { Check, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlanOption } from "@fxprime/types"
import type { PaidPlan } from "@/lib/subscription-checkout"
import { cn } from "@/lib/utils"

const PLAN_LABELS: Record<PaidPlan, string> = {
  BASIC: "Basic",
  PRO: "PRO live sessions",
  LIFETIME: "Lifetime",
}

const PLAN_DESCRIPTIONS: Record<PaidPlan, string> = {
  BASIC: "Unlock digital product discounts and expanded access beyond the free tier.",
  PRO: "Unlock interactive Q&A, group mentorship, premium blog access, and PRO live sessions.",
  LIFETIME: "One-time payment for permanent access to all current and future premium content.",
}

export function SubscriptionPlanSummary({
  plan,
  planOption,
}: {
  plan: PaidPlan
  planOption: PlanOption | null
}) {
  const features = planOption?.features ?? []

  return (
    <Card className="rounded-[20px]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{PLAN_LABELS[plan]}</CardTitle>
            <Badge variant="secondary" className="mt-2 rounded-lg">
              {plan} plan
            </Badge>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {PLAN_DESCRIPTIONS[plan]}
            </p>
          </div>
        </div>
      </CardHeader>
      {features.length > 0 && (
        <CardContent>
          <p className="mb-3 text-sm font-semibold text-foreground">What&apos;s included</p>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}

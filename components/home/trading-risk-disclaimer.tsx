"use client"

import { AlertTriangle } from "lucide-react"
import { LandingContainer } from "@/components/home/landing-container"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PublicHomepageSection } from "@fxprime/types"
import { mergeHomepageSection } from "@/lib/site-content-defaults"

interface TradingRiskDisclaimerProps {
  section?: PublicHomepageSection | null
}

export function TradingRiskDisclaimer({ section }: TradingRiskDisclaimerProps) {
  const content = mergeHomepageSection("risk_disclaimer", section)
  const label = (content.metadata?.label as string | undefined) ?? "Important Notice:"

  return (
    <section aria-label="Exam preparation notice" className="border-b border-border bg-muted/40 py-3">
      <LandingContainer>
        <Alert className="border-primary/30 bg-transparent">
          <AlertTriangle className="text-sidebar-accent-foreground" />
          <AlertDescription className="text-xs text-muted-foreground sm:text-sm">
            <strong className="text-foreground">{label}</strong> {content.description}
          </AlertDescription>
        </Alert>
      </LandingContainer>
    </section>
  )
}

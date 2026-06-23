"use client"

import { FAQAccordion } from "@/components/faq-accordion"
import { useSiteSettings } from "@/lib/hooks/use-site-content"

export function ContactFaq() {
  const { settings } = useSiteSettings()
  return <FAQAccordion items={settings.contactFaq} />
}

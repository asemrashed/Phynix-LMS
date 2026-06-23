"use client"

import Link from "next/link"
import { Mail, MapPin, MessageCircle, Receipt } from "lucide-react"
import { getWhatsAppUrl } from "@/lib/contact-info"
import { useSiteSettings } from "@/lib/hooks/use-site-content"
import { cn } from "@/lib/utils"

export function ContactInfoCards({ className }: { className?: string }) {
  const { settings } = useSiteSettings()
  const whatsappUrl = getWhatsAppUrl(
    "Hello IELTS LMS, I need help with...",
    settings.whatsappNumber
  )

  const cards = [
    {
      icon: Mail,
      title: "Email support",
      description: "Best for detailed questions and refund requests.",
      href: `mailto:${settings.supportEmail}`,
      action: settings.supportEmail,
      external: false,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick help for Bangladesh students.",
      href: whatsappUrl,
      action: "Chat on WhatsApp",
      external: true,
      hidden: !whatsappUrl,
    },
    {
      icon: Receipt,
      title: "Refund help",
      description: "Questions about payments, orders, or refunds.",
      href: "/refund-policy",
      action: "Refund policy",
      external: false,
    },
  ].filter((card) => !("hidden" in card && card.hidden))

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {cards.map((card) => {
        const Icon = card.icon
        const content = (
          <div className="group flex h-full flex-col rounded-[20px] border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{card.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{card.description}</p>
            <span className="mt-4 text-sm font-medium text-primary">{card.action}</span>
          </div>
        )

        if (!card.href) return <div key={card.title}>{content}</div>

        if (card.external) {
          return (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {content}
            </a>
          )
        }

        return (
          <Link key={card.title} href={card.href} className="block">
            {content}
          </Link>
        )
      })}

      <div className="relative overflow-hidden rounded-[20px] border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5 shadow-sm sm:col-span-2">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Visit our office</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {settings.officeAddress.line1}
            <br />
            {settings.officeAddress.line2}
          </p>
          <p className="mt-3 text-sm font-medium text-primary/90">{settings.officeHours}</p>
        </div>
      </div>
    </div>
  )
}

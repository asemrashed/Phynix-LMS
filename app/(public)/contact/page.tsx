import type { Metadata } from "next"
import { ContactForm } from "@/components/contact/contact-form"
import { ContactInfoCards } from "@/components/contact/contact-info-cards"
import { ContactFaq } from "@/components/contact/contact-faq"
import { ContactFormHeader, ContactPageHeader } from "@/components/contact/contact-page-header"

export const metadata: Metadata = {
  title: "Contact Us — PhynixEducation",
  description:
    "Get in touch with PhynixEducation for course help, payments, live sessions, and general support.",
}

export default function ContactPage() {
  return (
    <main>
      <div className="border-b border-border/60 bg-gradient-to-b from-primary/[0.04] via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <ContactPageHeader />

            <ContactInfoCards />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="rounded-[20px] border border-border/60 bg-card p-6 shadow-sm md:p-8">
                <ContactFormHeader />
                <ContactForm />
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="mb-4 text-xl font-bold text-foreground">Frequently asked</h2>
              <ContactFaq />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

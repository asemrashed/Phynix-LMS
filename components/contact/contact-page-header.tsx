"use client"

import { useSiteSettings } from "@/lib/hooks/use-site-content"

export function ContactPageHeader() {
  const { settings } = useSiteSettings()
  const { contactPage } = settings

  return (
    <div className="mb-12 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
        {contactPage.eyebrow}
      </p>
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">{contactPage.title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{contactPage.description}</p>
    </div>
  )
}

export function ContactFormHeader() {
  const { settings } = useSiteSettings()
  const { contactPage } = settings

  return (
    <>
      <h2 className="mb-1 text-xl font-bold text-foreground">{contactPage.formTitle}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{contactPage.formSubtitle}</p>
    </>
  )
}

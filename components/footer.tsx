import Link from "next/link"
import {
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { FooterSocialPlatform, PublicSiteSettings } from "@fxprime/types"
import { fetchServerApi } from "@/lib/api-url"
import { mergeSiteSettings } from "@/lib/site-content-defaults"
import { BRAND_MONOGRAM } from "@/lib/brand"

const SOCIAL_ICONS: Record<FooterSocialPlatform, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
}

const SOCIAL_LABELS: Record<FooterSocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  twitter: "Twitter",
}

export async function Footer() {
  const settings = mergeSiteSettings(
    await fetchServerApi<PublicSiteSettings>("/site/settings")
  )
  const { footer } = settings
  const socialLinks = footer.socialLinks.filter((link) => link.href.trim())

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col items-start space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-xl font-bold text-primary-foreground">{BRAND_MONOGRAM}</span>
              </div>
              <span className="text-xl font-bold text-foreground">{footer.brandName}</span>
            </Link>
            <p className="text-left text-sm leading-relaxed text-muted-foreground">
              {footer.brandTagline}
            </p>

            {socialLinks.length > 0 && (
              <div className="flex flex-col items-start space-y-2">
                <p className="text-sm font-semibold text-foreground">{footer.socialTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform]
                    return (
                      <a
                        key={`${social.platform}-${social.href}`}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label={SOCIAL_LABELS[social.platform]}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start">
            <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
              {footer.quickLinksTitle}
            </h3>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:flex-col sm:gap-0 sm:space-y-3">
              {footer.quickLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
              {footer.companyLinksTitle}
            </h3>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:flex-col sm:gap-0 sm:space-y-3">
              {footer.companyLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
              {footer.contactTitle}
            </h3>
            <ul className="flex flex-col items-start space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {settings.officeAddress.line1}
                  <br />
                  {settings.officeAddress.line2}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 sm:mt-12 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              {new Date().getFullYear()} {footer.copyrightText}
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-end">
              {footer.bottomLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

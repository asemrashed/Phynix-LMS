"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type {
  FooterContent,
  FooterSocialLink,
  FooterSocialPlatform,
  PublicSiteSettings,
  SiteCtaLink,
} from "@fxprime/types"
import { DEFAULT_FOOTER } from "@/lib/site-content-defaults"
import { AdminPageHeader } from "@/components/admin/admin-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const fieldClassName = "rounded-xl bg-white"

const SOCIAL_PLATFORMS: FooterSocialPlatform[] = [
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "twitter",
]

function LinkListEditor({
  label,
  links,
  onChange,
}: {
  label: string
  links: SiteCtaLink[]
  onChange: (links: SiteCtaLink[]) => void
}) {
  return (
    <div className="space-y-3 rounded-[20px] bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{label}</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => onChange([...links, { label: "", href: "" }])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add link
        </Button>
      </div>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              className={fieldClassName}
              value={link.label}
              onChange={(e) =>
                onChange(links.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))
              }
              placeholder="Label"
            />
            <Input
              className={fieldClassName}
              value={link.href}
              onChange={(e) =>
                onChange(links.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)))
              }
              placeholder="/path or https://..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground">No links yet.</p>
        )}
      </div>
    </div>
  )
}

function SocialLinksEditor({
  links,
  onChange,
}: {
  links: FooterSocialLink[]
  onChange: (links: FooterSocialLink[]) => void
}) {
  return (
    <div className="space-y-3 rounded-[20px] bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Social links</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => onChange([...links, { platform: "youtube", href: "" }])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add social
        </Button>
      </div>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-[180px_1fr_auto]">
            <Select
              value={link.platform}
              onValueChange={(value: FooterSocialPlatform) =>
                onChange(
                  links.map((item, i) =>
                    i === index ? { ...item, platform: value } : item
                  )
                )
              }
            >
              <SelectTrigger className={fieldClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_PLATFORMS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className={fieldClassName}
              value={link.href}
              onChange={(e) =>
                onChange(
                  links.map((item, i) => (i === index ? { ...item, href: e.target.value } : item))
                )
              }
              placeholder="https://..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground">No social links yet.</p>
        )}
      </div>
    </div>
  )
}

export function SiteFooterEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER)

  useEffect(() => {
    api<PublicSiteSettings>("/admin/site/settings")
      .then((data) => setFooter(data.footer))
      .catch(() => toast.error("Failed to load footer settings"))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const payload: FooterContent = {
        ...footer,
        quickLinks: footer.quickLinks.filter((l) => l.label.trim() && l.href.trim()),
        companyLinks: footer.companyLinks.filter((l) => l.label.trim() && l.href.trim()),
        bottomLinks: footer.bottomLinks.filter((l) => l.label.trim() && l.href.trim()),
        socialLinks: footer.socialLinks.filter((l) => l.href.trim()),
      }
      const updated = await api<PublicSiteSettings>("/admin/site/footer", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      setFooter(updated.footer)
      toast.success("Footer saved")
    } catch {
      toast.error("Failed to save footer")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Footer"
        description="Brand copy, navigation links, social profiles, and copyright bar."
      />

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Brand</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Brand name</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={footer.brandName}
              onChange={(e) => setFooter((prev) => ({ ...prev, brandName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Copyright text</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={footer.copyrightText}
              onChange={(e) => setFooter((prev) => ({ ...prev, copyrightText: e.target.value }))}
              placeholder="PhynixEducation. All rights reserved."
            />
          </div>
        </div>
        <div>
          <Label>Tagline</Label>
          <Textarea
            className={`mt-1 ${fieldClassName}`}
            rows={3}
            value={footer.brandTagline}
            onChange={(e) => setFooter((prev) => ({ ...prev, brandTagline: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-[20px] bg-card p-6 shadow-sm md:grid-cols-2">
        <div>
          <Label>Quick links column title</Label>
          <Input
            className={`mt-1 ${fieldClassName}`}
            value={footer.quickLinksTitle}
            onChange={(e) => setFooter((prev) => ({ ...prev, quickLinksTitle: e.target.value }))}
          />
        </div>
        <div>
          <Label>Company links column title</Label>
          <Input
            className={`mt-1 ${fieldClassName}`}
            value={footer.companyLinksTitle}
            onChange={(e) => setFooter((prev) => ({ ...prev, companyLinksTitle: e.target.value }))}
          />
        </div>
        <div>
          <Label>Contact column title</Label>
          <Input
            className={`mt-1 ${fieldClassName}`}
            value={footer.contactTitle}
            onChange={(e) => setFooter((prev) => ({ ...prev, contactTitle: e.target.value }))}
          />
        </div>
        <div>
          <Label>Social section title</Label>
          <Input
            className={`mt-1 ${fieldClassName}`}
            value={footer.socialTitle}
            onChange={(e) => setFooter((prev) => ({ ...prev, socialTitle: e.target.value }))}
          />
        </div>
      </div>

      <LinkListEditor
        label="Quick links"
        links={footer.quickLinks}
        onChange={(quickLinks) => setFooter((prev) => ({ ...prev, quickLinks }))}
      />

      <LinkListEditor
        label="Company links"
        links={footer.companyLinks}
        onChange={(companyLinks) => setFooter((prev) => ({ ...prev, companyLinks }))}
      />

      <LinkListEditor
        label="Bottom bar links"
        links={footer.bottomLinks}
        onChange={(bottomLinks) => setFooter((prev) => ({ ...prev, bottomLinks }))}
      />

      <SocialLinksEditor
        links={footer.socialLinks}
        onChange={(socialLinks) => setFooter((prev) => ({ ...prev, socialLinks }))}
      />

      <div className="flex justify-end">
        <Button className="rounded-xl" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save footer"}
        </Button>
      </div>
    </div>
  )
}

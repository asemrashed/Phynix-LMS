"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AdminHomepageSectionDetail, HomepageSectionItem, SiteCtaLink } from "@fxprime/types"
import { AdminPageHeader } from "@/components/admin/admin-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const SECTION_LABELS: Record<string, string> = {
  featured_courses: "Featured Courses",
  latest_insights: "Latest Insights",
  testimonials: "Testimonials",
  risk_disclaimer: "Risk Disclaimer",
  trust_bar: "Trust Bar",
  free_learning_hub: "Free Learning Hub",
  pricing: "Pricing",
  why_choose: "Why Choose",
  final_cta: "Final CTA",
}

/** Hidden from admin CMS until explicitly re-enabled in code. */
const LOCKED_HOMEPAGE_SECTION_KEYS = new Set(["hero"])

const fieldClassName = "rounded-xl bg-white"

function CtaFields({
  label,
  value,
  onChange,
}: {
  label: string
  value: SiteCtaLink | null
  onChange: (value: SiteCtaLink | null) => void
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            onChange(checked ? { label: "", href: "" } : null)
          }
        />
      </div>
      {value && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            className={fieldClassName}
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })}
            placeholder="Button label"
          />
          <Input
            className={fieldClassName}
            value={value.href}
            onChange={(e) => onChange({ ...value, href: e.target.value })}
            placeholder="/path"
          />
        </div>
      )}
    </div>
  )
}

function SectionEditor({
  section,
  onSaved,
}: {
  section: AdminHomepageSectionDetail
  onSaved: (section: AdminHomepageSectionDetail) => void
}) {
  const [saving, setSaving] = useState(false)
  const [eyebrow, setEyebrow] = useState(section.eyebrow ?? "")
  const [title, setTitle] = useState(section.title ?? "")
  const [description, setDescription] = useState(section.description ?? "")
  const [items, setItems] = useState<HomepageSectionItem[]>(section.items)
  const [ctaPrimary, setCtaPrimary] = useState<SiteCtaLink | null>(section.ctaPrimary)
  const [ctaSecondary, setCtaSecondary] = useState<SiteCtaLink | null>(section.ctaSecondary)
  const [metadataLabel, setMetadataLabel] = useState(
    (section.metadata?.label as string | undefined) ?? ""
  )
  const [metadataFootnote, setMetadataFootnote] = useState(
    (section.metadata?.footnote as string | undefined) ?? ""
  )
  const [metadataImageUrl, setMetadataImageUrl] = useState(
    (section.metadata?.imageUrl as string | undefined) ?? ""
  )
  const [isPublished, setIsPublished] = useState(section.isPublished)

  useEffect(() => {
    setEyebrow(section.eyebrow ?? "")
    setTitle(section.title ?? "")
    setDescription(section.description ?? "")
    setItems(section.items)
    setCtaPrimary(section.ctaPrimary)
    setCtaSecondary(section.ctaSecondary)
    setMetadataLabel((section.metadata?.label as string | undefined) ?? "")
    setMetadataFootnote((section.metadata?.footnote as string | undefined) ?? "")
    setMetadataImageUrl((section.metadata?.imageUrl as string | undefined) ?? "")
    setIsPublished(section.isPublished)
  }, [section])

  const updateItem = (
    index: number,
    field: keyof HomepageSectionItem,
    value: string | boolean
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      const metadata: Record<string, unknown> = { ...(section.metadata ?? {}) }
      if (section.key === "risk_disclaimer") metadata.label = metadataLabel || "Risk Disclaimer:"
      if (section.key === "pricing") metadata.footnote = metadataFootnote

      const updated = await api<AdminHomepageSectionDetail>(`/admin/site/homepage/${section.key}`, {
        method: "PATCH",
        body: JSON.stringify({
          eyebrow: eyebrow || null,
          title: title || null,
          description: description || null,
          items,
          ctaPrimary,
          ctaSecondary,
          metadata,
          isPublished,
        }),
      })
      onSaved(updated)
      toast.success("Section saved")
    } catch {
      toast.error("Failed to save section")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{SECTION_LABELS[section.key] ?? section.key}</h2>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Published</Label>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Eyebrow</Label>
          <Input className={`mt-1 ${fieldClassName}`} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </div>
        <div>
          <Label>Title</Label>
          <Input className={`mt-1 ${fieldClassName}`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          className={`mt-1 ${fieldClassName}`}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <CtaFields label="Primary CTA" value={ctaPrimary} onChange={setCtaPrimary} />
      <CtaFields label="Secondary CTA" value={ctaSecondary} onChange={setCtaSecondary} />

      {section.key === "risk_disclaimer" && (
        <div>
          <Label>Disclaimer label</Label>
          <Input
            className={`mt-1 ${fieldClassName}`}
            value={metadataLabel}
            onChange={(e) => setMetadataLabel(e.target.value)}
            placeholder="Risk Disclaimer:"
          />
        </div>
      )}

      {section.key === "pricing" && (
        <div>
          <Label>Footnote below pricing cards</Label>
          <Textarea
            className={`mt-1 ${fieldClassName}`}
            rows={2}
            value={metadataFootnote}
            onChange={(e) => setMetadataFootnote(e.target.value)}
          />
        </div>
      )}

      {items.length > 0 ||
      ["why_choose", "trust_bar", "free_learning_hub"].includes(
        section.key
      ) ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Feature cards</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() =>
                setItems((prev) => [...prev, { icon: "Star", title: "", description: "" }])
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add card
            </Button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Card {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  className={fieldClassName}
                  value={item.icon ?? ""}
                  onChange={(e) => updateItem(index, "icon", e.target.value)}
                  placeholder="Icon name (Lucide)"
                />
                <Input
                  className={fieldClassName}
                  value={item.type ?? ""}
                  onChange={(e) => updateItem(index, "type", e.target.value)}
                  placeholder="Type slug (consultation)"
                />
                <Input
                  className={fieldClassName}
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="Title"
                />
                <Input
                  className={fieldClassName}
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Description"
                />
                <Input
                  className={fieldClassName}
                  value={item.href ?? ""}
                  onChange={(e) => updateItem(index, "href", e.target.value)}
                  placeholder="Link href"
                />
                <Input
                  className={fieldClassName}
                  value={item.statKey ?? ""}
                  onChange={(e) => updateItem(index, "statKey", e.target.value)}
                  placeholder="statKey (e.g. students)"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(item.external)}
                    onChange={(e) => updateItem(index, "external", e.target.checked)}
                  />
                  Open in new tab
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button className="rounded-xl" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save section"}
        </Button>
      </div>
    </div>
  )
}

export function HomepageSectionsEditor() {
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState<AdminHomepageSectionDetail[]>([])
  const [activeKey, setActiveKey] = useState("featured_courses")

  useEffect(() => {
    api<AdminHomepageSectionDetail[]>("/admin/site/homepage")
      .then((data) => {
        const editable = data.filter((section) => !LOCKED_HOMEPAGE_SECTION_KEYS.has(section.key))
        setSections(editable)
        if (editable[0]) setActiveKey(editable[0].key)
      })
      .catch(() => toast.error("Failed to load homepage sections"))
      .finally(() => setLoading(false))
  }, [])

  const activeSection = sections.find((section) => section.key === activeKey)

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage sections"
        description="Edit features, trust bar, and other homepage copy."
      />

      <Tabs value={activeKey} onValueChange={setActiveKey}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted p-1">
          {sections.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="rounded-lg">
              {SECTION_LABELS[section.key] ?? section.key}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.key} value={section.key} className="mt-4">
            {activeSection?.key === section.key && (
              <SectionEditor
                section={section}
                onSaved={(updated) =>
                  setSections((prev) => prev.map((item) => (item.key === updated.key ? updated : item)))
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

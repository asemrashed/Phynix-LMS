"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { ContactFaqItem, PublicSiteSettings } from "@fxprime/types"
import { AdminPageHeader } from "@/components/admin/admin-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const fieldClassName = "rounded-xl bg-white"

export function SiteContactForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [supportEmail, setSupportEmail] = useState("")
  const [officeLine1, setOfficeLine1] = useState("")
  const [officeLine2, setOfficeLine2] = useState("")
  const [officeHours, setOfficeHours] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [contactFaq, setContactFaq] = useState<ContactFaqItem[]>([])
  const [contactEyebrow, setContactEyebrow] = useState("")
  const [contactTitle, setContactTitle] = useState("")
  const [contactDescription, setContactDescription] = useState("")
  const [contactFormTitle, setContactFormTitle] = useState("")
  const [contactFormSubtitle, setContactFormSubtitle] = useState("")

  useEffect(() => {
    api<PublicSiteSettings>("/admin/site/settings")
      .then((data) => {
        setSupportEmail(data.supportEmail)
        setOfficeLine1(data.officeAddress.line1)
        setOfficeLine2(data.officeAddress.line2)
        setOfficeHours(data.officeHours)
        setWhatsappNumber(data.whatsappNumber ?? "")
        setContactFaq(data.contactFaq)
        setContactEyebrow(data.contactPage.eyebrow)
        setContactTitle(data.contactPage.title)
        setContactDescription(data.contactPage.description)
        setContactFormTitle(data.contactPage.formTitle)
        setContactFormSubtitle(data.contactPage.formSubtitle)
      })
      .catch(() => toast.error("Failed to load contact settings"))
      .finally(() => setLoading(false))
  }, [])

  const updateFaq = (index: number, field: keyof ContactFaqItem, value: string) => {
    setContactFaq((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      await api("/admin/site/settings", {
        method: "PATCH",
        body: JSON.stringify({
          supportEmail,
          officeAddress: { line1: officeLine1, line2: officeLine2 },
          officeHours,
          whatsappNumber: whatsappNumber.trim() || null,
          contactFaq: contactFaq.filter((item) => item.question.trim() && item.answer.trim()),
          contactPage: {
            eyebrow: contactEyebrow,
            title: contactTitle,
            description: contactDescription,
            formTitle: contactFormTitle,
            formSubtitle: contactFormSubtitle,
          },
        }),
      })
      toast.success("Contact settings saved")
    } catch {
      toast.error("Failed to save")
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
        title="Contact & FAQ"
        description="Email, office details, WhatsApp, page headers, and contact FAQ."
      />

      <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Contact page header</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Eyebrow</Label>
            <Input className={`mt-1 ${fieldClassName}`} value={contactEyebrow} onChange={(e) => setContactEyebrow(e.target.value)} />
          </div>
          <div>
            <Label>Title</Label>
            <Input className={`mt-1 ${fieldClassName}`} value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea className={`mt-1 ${fieldClassName}`} rows={2} value={contactDescription} onChange={(e) => setContactDescription(e.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Form title</Label>
            <Input className={`mt-1 ${fieldClassName}`} value={contactFormTitle} onChange={(e) => setContactFormTitle(e.target.value)} />
          </div>
          <div>
            <Label>Form subtitle</Label>
            <Input className={`mt-1 ${fieldClassName}`} value={contactFormSubtitle} onChange={(e) => setContactFormSubtitle(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 rounded-[20px] bg-card p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Support email</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Office address line 1</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={officeLine1}
              onChange={(e) => setOfficeLine1(e.target.value)}
            />
          </div>
          <div>
            <Label>Office address line 2</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={officeLine2}
              onChange={(e) => setOfficeLine2(e.target.value)}
            />
          </div>
          <div>
            <Label>Office hours</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
            />
          </div>
          <div>
            <Label>WhatsApp number</Label>
            <Input
              className={`mt-1 ${fieldClassName}`}
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+880..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used on the contact page. Falls back to NEXT_PUBLIC_WHATSAPP_NUMBER if empty.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>FAQ items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setContactFaq((prev) => [...prev, { question: "", answer: "" }])}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add FAQ
            </Button>
          </div>
          <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
            {contactFaq.map((item, index) => (
              <div key={index} className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">FAQ {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setContactFaq((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  className={`mb-2 ${fieldClassName}`}
                  value={item.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  placeholder="Question"
                />
                <Textarea
                  className={fieldClassName}
                  rows={3}
                  value={item.answer}
                  onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="rounded-xl" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

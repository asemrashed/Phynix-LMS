"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { downloadCvPdf } from "@/lib/cv-download"
import type { StudentCvDraft, StudentCvResponse, StudentPortfolio } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

function CvPreview({
  draft,
  portfolio,
}: {
  draft: StudentCvDraft
  portfolio: StudentPortfolio
}) {
  const completed = draft.includeCompletedCourses
    ? portfolio.enrollments.filter((e) => e.progress === 100)
    : []
  const certs = draft.includeCertificates ? portfolio.certificates : []

  return (
    <div className="rounded-[20px] border bg-white p-8 text-slate-800 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-accent-foreground">
        IELTS LMS
      </p>
      <h2 className="mt-2 text-2xl font-bold">
        {portfolio.profile.firstName} {portfolio.profile.lastName}
      </h2>
      {draft.headline && <p className="text-sm text-slate-600">{draft.headline}</p>}
      <p className="mt-2 text-xs text-slate-500">
        {[draft.contactEmail, draft.contactPhone, portfolio.profile.uniqueStudentId]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {draft.summary && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase text-sidebar-accent-foreground">Summary</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{draft.summary}</p>
        </div>
      )}

      {draft.skills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase text-sidebar-accent-foreground">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {draft.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-lg text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {draft.experience.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase text-sidebar-accent-foreground">Experience</h3>
          <ul className="mt-2 space-y-3">
            {draft.experience.map((exp, i) => (
              <li key={i} className="text-sm">
                <p className="font-medium">{exp.title} — {exp.organization}</p>
                <p className="text-xs text-slate-500">{exp.year}</p>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-600">{exp.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase text-sidebar-accent-foreground">Completed Courses</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {completed.map((e) => (
              <li key={e.id}>• {e.course.title}</li>
            ))}
          </ul>
        </div>
      )}

      {certs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase text-sidebar-accent-foreground">Certificates</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {certs.map((c) => (
              <li key={c.id}>• {c.courseTitle}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function CVBuilderPage() {
  const [draft, setDraft] = useState<StudentCvDraft | null>(null)
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [skillsText, setSkillsText] = useState("")

  useEffect(() => {
    api<StudentCvResponse>("/students/me/cv")
      .then((data) => {
        setDraft(data.draft)
        setPortfolio(data.portfolio)
        setSkillsText(data.draft.skills.join(", "))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateDraft = (patch: Partial<StudentCvDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const save = async () => {
    if (!draft) return
    const payload = {
      ...draft,
      skills: skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    setSaving(true)
    try {
      const res = await api<{ draft: StudentCvDraft }>("/students/me/cv", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      setDraft(res.draft)
      setSkillsText(res.draft.skills.join(", "))
      toast.success("CV draft saved")
    } catch {
      toast.error("Failed to save CV")
    } finally {
      setSaving(false)
    }
  }

  const download = async () => {
    if (!draft || !portfolio) return
    const payload = {
      ...draft,
      skills: skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    setDownloading(true)
    try {
      await downloadCvPdf(
        payload,
        `FXPrime-CV-${portfolio.profile.firstName}-${portfolio.profile.lastName}.pdf`
      )
      toast.success("CV downloaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[20px] bg-muted" />
        <div className="h-96 animate-pulse rounded-[20px] bg-muted" />
      </div>
    )
  }

  if (!draft || !portfolio) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">CV Builder</h1>
          </div>
          <p className="text-muted-foreground">
            Build a professional CV — auto-includes your courses and certificates from IELTS LMS.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" disabled={saving} onClick={save}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button className="rounded-xl" disabled={downloading} onClick={download}>
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              className="rounded-xl"
              placeholder="IELTS & Academic English Professional"
              value={draft.headline || ""}
              onChange={(e) => updateDraft({ headline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea
              id="summary"
              className="rounded-xl"
              rows={4}
              value={draft.summary || ""}
              onChange={(e) => updateDraft({ summary: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Contact email</Label>
              <Input
                id="email"
                type="email"
                className="rounded-xl"
                value={draft.contactEmail || ""}
                onChange={(e) => updateDraft({ contactEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                className="rounded-xl"
                value={draft.contactPhone || ""}
                onChange={(e) => updateDraft({ contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              className="rounded-xl"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="IELTS Preparation, Academic Writing, Public Speaking"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Experience</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  updateDraft({
                    experience: [
                      ...draft.experience,
                      { title: "", organization: "", year: "" },
                    ],
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {draft.experience.map((exp, index) => (
              <div key={index} className="space-y-2 rounded-xl border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    className="rounded-xl"
                    placeholder="Job title"
                    value={exp.title}
                    onChange={(e) =>
                      updateDraft({
                        experience: draft.experience.map((item, i) =>
                          i === index ? { ...item, title: e.target.value } : item
                        ),
                      })
                    }
                  />
                  <Input
                    className="rounded-xl"
                    placeholder="Organization"
                    value={exp.organization}
                    onChange={(e) =>
                      updateDraft({
                        experience: draft.experience.map((item, i) =>
                          i === index ? { ...item, organization: e.target.value } : item
                        ),
                      })
                    }
                  />
                </div>
                <Input
                  className="rounded-xl"
                  placeholder="2020–2024"
                  value={exp.year}
                  onChange={(e) =>
                    updateDraft({
                      experience: draft.experience.map((item, i) =>
                        i === index ? { ...item, year: e.target.value } : item
                      ),
                    })
                  }
                />
                <Textarea
                  className="rounded-xl"
                  rows={2}
                  placeholder="Description (optional)"
                  value={exp.description || ""}
                  onChange={(e) =>
                    updateDraft({
                      experience: draft.experience.map((item, i) =>
                        i === index ? { ...item, description: e.target.value } : item
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-destructive"
                  onClick={() =>
                    updateDraft({
                      experience: draft.experience.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="includeCourses">Include completed courses</Label>
              <Switch
                id="includeCourses"
                checked={draft.includeCompletedCourses}
                onCheckedChange={(v) => updateDraft({ includeCompletedCourses: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeCerts">Include certificates</Label>
              <Switch
                id="includeCerts"
                checked={draft.includeCertificates}
                onCheckedChange={(v) => updateDraft({ includeCertificates: v })}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">Live preview</p>
          <CvPreview draft={{ ...draft, skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean) }} portfolio={portfolio} />
        </div>
      </div>
    </div>
  )
}

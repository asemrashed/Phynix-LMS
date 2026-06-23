"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Download,
  ExternalLink,
  Copy,
  Check,
  Search,
  ShieldCheck,
} from "lucide-react"
import type { CertificateItem } from "@fxprime/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { downloadCertificatePdf } from "@/lib/certificate-download"

interface CertificateVaultProps {
  certificates: CertificateItem[]
  loading?: boolean
}

type FilterTab = "all" | "active" | "revoked"

export function CertificateVault({ certificates, loading }: CertificateVaultProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return certificates.filter((cert) => {
      if (filter === "active" && cert.isRevoked) return false
      if (filter === "revoked" && !cert.isRevoked) return false
      if (!q) return true
      return (
        cert.courseTitle.toLowerCase().includes(q) ||
        cert.certCode.toLowerCase().includes(q)
      )
    })
  }, [certificates, filter, search])

  const activeCount = certificates.filter((c) => !c.isRevoked).length
  const revokedCount = certificates.filter((c) => c.isRevoked).length

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success("Certificate code copied")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-[20px] bg-muted" />
        ))}
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-[20px] bg-card p-12 text-center shadow-sm">
        <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">No certificates yet</h2>
        <p className="mt-2 text-muted-foreground">
          Complete a course to earn your first certificate
        </p>
        <Link href="/dashboard/courses">
          <Button className="mt-6 rounded-xl">Go to My Courses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[20px] bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="mt-1 text-2xl font-bold">{certificates.length}</p>
        </div>
        <div className="rounded-[20px] bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-bold text-primary">{activeCount}</p>
        </div>
        <div className="rounded-[20px] bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Revoked</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{revokedCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course or certificate code..."
            className="rounded-xl pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">
              All ({certificates.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg">
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="revoked" className="rounded-lg">
              Revoked ({revokedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[20px] bg-card p-8 text-center text-muted-foreground">
          No certificates match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((cert) => (
            <div
              key={cert.id}
              className={cn(
                "flex flex-col rounded-[20px] border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
                cert.isRevoked ? "border-destructive/30 opacity-80" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                {cert.isRevoked ? (
                  <Badge variant="destructive">Revoked</Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <h3 className="mt-4 line-clamp-2 font-semibold text-foreground">
                {cert.courseTitle}
              </h3>

              <div className="mt-2 flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {cert.certCode}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => copyCode(cert.certCode)}
                >
                  {copiedCode === cert.certCode ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Issued {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/verify/${cert.certCode}`} target="_blank">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="rounded-xl"
                  disabled={cert.isRevoked || !cert.pdfUrl}
                  onClick={() =>
                    downloadCertificatePdf(cert.certCode).catch((e) =>
                      toast.error(e.message)
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

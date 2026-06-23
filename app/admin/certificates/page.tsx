"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { api, ApiError, getAccessToken } from "@/lib/api"
import { resolveApiUrl } from "@/lib/api-url"
import { downloadCertificatePdf } from "@/lib/certificate-download"
import type {
  AdminCertificateFailedItem,
  AdminCertificateItem,
  AdminCertificateListResult,
  PaginatedResult,
} from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldOff,
  FileDown,
  Plus,
  AlertTriangle,
} from "lucide-react"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type StatusFilter = "all" | "active" | "revoked"

export default function AdminCertificatesPage() {
  const [result, setResult] = useState<AdminCertificateListResult | null>(null)
  const [failedResult, setFailedResult] = useState<PaginatedResult<AdminCertificateFailedItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [failedLoading, setFailedLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [failedPage, setFailedPage] = useState(1)
  const [revokeTarget, setRevokeTarget] = useState<AdminCertificateItem | null>(null)
  const [revokeReason, setRevokeReason] = useState("")
  const [revoking, setRevoking] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [issueStudentId, setIssueStudentId] = useState("")
  const [issueCourseId, setIssueCourseId] = useState("")
  const [issuing, setIssuing] = useState(false)
  const [activeTab, setActiveTab] = useState("issued")

  const fetchCertificates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set("search", search.trim())
      if (status !== "all") params.set("status", status)
      params.set("page", String(page))
      params.set("pageSize", "20")
      const data = await api<AdminCertificateListResult>(
        `/admin/certificates?${params.toString()}`
      )
      setResult(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load certificates"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  const fetchFailed = useCallback(async () => {
    setFailedLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(failedPage))
      params.set("pageSize", "20")
      const data = await api<PaginatedResult<AdminCertificateFailedItem>>(
        `/admin/certificates/failed?${params.toString()}`
      )
      setFailedResult(data)
    } catch {
      setFailedResult(null)
    } finally {
      setFailedLoading(false)
    }
  }, [failedPage])

  useEffect(() => {
    const timer = setTimeout(fetchCertificates, 300)
    return () => clearTimeout(timer)
  }, [fetchCertificates])

  useEffect(() => {
    if (activeTab === "failed") fetchFailed()
  }, [activeTab, fetchFailed])

  const handleRevoke = async () => {
    if (!revokeTarget || revokeReason.trim().length < 3) return
    setRevoking(true)
    try {
      const updated = await api<AdminCertificateItem>(
        `/admin/certificates/${revokeTarget.id}/revoke`,
        {
          method: "POST",
          body: JSON.stringify({ reason: revokeReason.trim() }),
        }
      )
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((c) => (c.id === updated.id ? updated : c)),
            }
          : prev
      )
      setRevokeTarget(null)
      setRevokeReason("")
      toast.success("Certificate revoked")
      fetchCertificates()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to revoke certificate"
      toast.error(message)
    } finally {
      setRevoking(false)
    }
  }

  const handleRegenerate = async (cert: AdminCertificateItem) => {
    try {
      const updated = await api<AdminCertificateItem>(
        `/admin/certificates/${cert.id}/regenerate`,
        { method: "POST" }
      )
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((c) => (c.id === updated.id ? updated : c)),
            }
          : prev
      )
      toast.success("PDF regenerated")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Regeneration failed")
    }
  }

  const handleIssue = async () => {
    if (!issueStudentId.trim() || !issueCourseId.trim()) return
    setIssuing(true)
    try {
      await api<AdminCertificateItem>("/admin/certificates/issue", {
        method: "POST",
        body: JSON.stringify({
          studentId: issueStudentId.trim(),
          courseId: issueCourseId.trim(),
        }),
      })
      toast.success("Certificate issued")
      setIssueOpen(false)
      setIssueStudentId("")
      setIssueCourseId("")
      fetchCertificates()
      fetchFailed()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Issue failed")
    } finally {
      setIssuing(false)
    }
  }

  const handleRetry = async (enrollmentId: string) => {
    try {
      await api("/admin/certificates/retry", {
        method: "POST",
        body: JSON.stringify({ enrollmentId }),
      })
      toast.success("Retry queued")
      fetchFailed()
      fetchCertificates()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Retry failed")
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (status !== "all") params.set("status", status)
    const token = getAccessToken()
    const url = resolveApiUrl(`/admin/certificates/export?${params.toString()}`)
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Export failed")
        const blob = await res.blob()
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `certificates-${Date.now()}.csv`
        a.click()
      })
      .catch(() => toast.error("CSV export failed"))
  }

  const certificates = result?.items ?? []
  const stats = result?.stats
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certificates</h1>
          <p className="text-sm text-muted-foreground">
            View, issue, revoke, and manage issued certificates
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setIssueOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Issue Manual
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl">Back</Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Revoked", value: stats.revoked },
            { label: "Failed", value: stats.failed },
          ].map((s) => (
            <div key={s.label} className="rounded-[20px] bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 rounded-xl bg-white border border-border/60">
          <TabsTrigger value="issued" className="rounded-lg">Issued</TabsTrigger>
          <TabsTrigger value="failed" className="rounded-lg">
            Failed {(stats?.failed ?? failedResult?.total ?? 0) > 0 &&
              `(${stats?.failed ?? failedResult?.total})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issued" className="rounded-[20px] border border-border/60 bg-white p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search student, course, or code..."
                className="rounded-xl border-border/60 bg-white pl-9"
              />
            </div>
            <Tabs
              value={status}
              onValueChange={(v) => {
                setStatus(v as StatusFilter)
                setPage(1)
              }}
            >
              <TabsList className="rounded-xl bg-white border border-border/60">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg">Active</TabsTrigger>
                <TabsTrigger value="revoked" className="rounded-lg">Revoked</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[20px] bg-muted" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="rounded-[20px] bg-card p-10 text-center">
              <Award className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No certificates found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Certificates appear when a student completes 100% of a course
                (all lessons completed). Use &quot;Issue Manual&quot; for
                completed enrollments, or complete a course as a test student.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-[20px] bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between",
                      cert.isRevoked && "opacity-80"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{cert.courseTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {cert.studentName} · {cert.studentId}
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {cert.certCode}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                        {cert.isRevoked && cert.revokedReason && (
                          <p className="mt-1 text-xs text-destructive">
                            Revoked: {cert.revokedReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={cert.isRevoked ? "destructive" : "default"}>
                        {cert.isRevoked ? "Revoked" : "Active"}
                      </Badge>
                      <Link href={`/verify/${cert.certCode}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Verify
                        </Button>
                      </Link>
                      {!cert.isRevoked && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              downloadCertificatePdf(cert.certCode).catch((e) =>
                                toast.error(e.message)
                              )
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleRegenerate(cert)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              setRevokeTarget(cert)
                              setRevokeReason("")
                            }}
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Revoke
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <AdminListPagination
                page={page}
                pageSize={result?.pageSize ?? 20}
                total={result?.total ?? 0}
                onPageChange={setPage}
                className="mt-6 justify-center"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="failed" className="rounded-[20px] border border-border/60 bg-white p-6">
          {failedLoading ? (
            <div className="rounded-[20px] bg-card p-10 text-center text-muted-foreground">
              Loading…
            </div>
          ) : !failedResult || failedResult.items.length === 0 ? (
            <div className="rounded-[20px] bg-card p-10 text-center text-muted-foreground">
              No failed certificate generations.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {failedResult.items.map((item) => (
                  <div
                    key={item.enrollmentId}
                    className="flex flex-col gap-3 rounded-[20px] border border-destructive/20 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                      <div>
                        <p className="font-semibold">{item.courseTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.studentName} · {item.uniqueStudentId}
                        </p>
                        {item.certificateError && (
                          <p className="mt-1 text-xs text-destructive">
                            {item.certificateError}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => handleRetry(item.enrollmentId)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                ))}
              </div>
              <AdminListPagination
                page={failedPage}
                pageSize={failedResult.pageSize}
                total={failedResult.total}
                onPageChange={setFailedPage}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              Revoking {revokeTarget?.certCode} for {revokeTarget?.studentName}. The
              student will be notified by email and in-app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Academic misconduct, refund issued..."
              className="rounded-xl"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setRevokeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={revokeReason.trim().length < 3 || revoking}
              onClick={handleRevoke}
            >
              {revoking ? "Revoking..." : "Revoke Certificate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Issue Certificate Manually</DialogTitle>
            <DialogDescription>
              Issue for a student who has 100% course progress. Find IDs in Admin →
              Users or Prisma Studio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID (UUID)</Label>
              <Input
                id="studentId"
                value={issueStudentId}
                onChange={(e) => setIssueStudentId(e.target.value)}
                placeholder="student uuid"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseId">Course ID (UUID)</Label>
              <Input
                id="courseId"
                value={issueCourseId}
                onChange={(e) => setIssueCourseId(e.target.value)}
                placeholder="course uuid"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              disabled={issuing || !issueStudentId.trim() || !issueCourseId.trim()}
              onClick={handleIssue}
            >
              {issuing ? "Issuing..." : "Issue Certificate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

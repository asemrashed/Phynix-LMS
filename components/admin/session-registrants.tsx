"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { FileDown, Plus, Search } from "lucide-react"
import { api, ApiError, getAccessToken } from "@/lib/api"
import type {
  AdminLiveSessionRegistration,
  AdminLiveSessionRegistrationCandidate,
  AdminLiveSessionRegistrationsResult,
} from "@fxprime/types"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

import { resolveApiUrl } from "@/lib/api-url"

interface SessionRegistrantsProps {
  sessionId: string
  sessionStatus?: string
  onAttendanceChange?: (attendedCount: number) => void
  onRegistrationChange?: (registrationCount: number) => void
}

export function SessionRegistrants({
  sessionId,
  sessionStatus,
  onAttendanceChange,
  onRegistrationChange,
}: SessionRegistrantsProps) {
  const [result, setResult] = useState<AdminLiveSessionRegistrationsResult | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [candidates, setCandidates] = useState<AdminLiveSessionRegistrationCandidate[]>([])
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const pageSize = 20

  const canAddRegistrants = sessionStatus === "SCHEDULED"

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("pageSize", String(pageSize))
      const data = await api<AdminLiveSessionRegistrationsResult>(
        `/admin/sessions/${sessionId}/registrations?${params.toString()}`
      )
      setResult(data)
      onAttendanceChange?.(data.attendedCount)
      onRegistrationChange?.(data.total)
      const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
      if (data.items.length === 0 && data.total > 0 && page > totalPages) {
        setPage(totalPages)
      }
    } catch {
      toast.error("Failed to load registrants")
    } finally {
      setLoading(false)
    }
  }, [sessionId, page])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  useEffect(() => {
    if (!addOpen) {
      setSearch("")
      setCandidates([])
      return
    }

    const q = search.trim()
    if (q.length < 2) {
      setCandidates([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({ search: q })
        const data = await api<AdminLiveSessionRegistrationCandidate[]>(
          `/admin/sessions/${sessionId}/registrations/candidates?${params.toString()}`
        )
        setCandidates(data)
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Search failed"
        toast.error(message)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [addOpen, search, sessionId])

  async function toggleAttendance(reg: AdminLiveSessionRegistration) {
    try {
      const updated = await api<AdminLiveSessionRegistration>(
        `/admin/sessions/${sessionId}/registrations/${reg.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ attended: !reg.attended }),
        }
      )
      setResult((prev) => {
        if (!prev) return prev
        const attendedDelta = updated.attended === reg.attended ? 0 : updated.attended ? 1 : -1
        const nextAttended = prev.attendedCount + attendedDelta
        onAttendanceChange?.(nextAttended)
        return {
          ...prev,
          attendedCount: nextAttended,
          items: prev.items.map((r) => (r.id === updated.id ? updated : r)),
        }
      })
      toast.success(updated.attended ? "Marked attended" : "Marked absent")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update attendance"
      toast.error(message)
    }
  }

  async function addRegistrant(candidate: AdminLiveSessionRegistrationCandidate) {
    setAddingId(candidate.studentId)
    try {
      const created = await api<AdminLiveSessionRegistration>(
        `/admin/sessions/${sessionId}/registrations`,
        {
          method: "POST",
          body: JSON.stringify({ studentId: candidate.studentId }),
        }
      )
      setAddOpen(false)
      toast.success(`${candidate.studentName} registered`)
      if (page === 1) {
        setResult((prev) => {
          if (!prev) return prev
          const nextTotal = prev.total + 1
          onRegistrationChange?.(nextTotal)
          return {
            ...prev,
            total: nextTotal,
            items: [created, ...prev.items].slice(0, prev.pageSize),
          }
        })
      } else {
        setPage(1)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to add registrant"
      toast.error(message)
    } finally {
      setAddingId(null)
    }
  }

  function handleExport() {
    const token = getAccessToken()
    const url = resolveApiUrl(`/admin/sessions/${sessionId}/registrations/export`)
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Export failed")
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = objectUrl
        a.download = `session-registrants-${sessionId}.csv`
        a.click()
        URL.revokeObjectURL(objectUrl)
      })
      .catch(() => toast.error("Failed to export registrants"))
  }

  if (loading && !result) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  const registrations = result?.items ?? []
  const total = result?.total ?? 0
  const attendedCount = result?.attendedCount ?? 0

  return (
    <div className="space-y-4 rounded-[20px] bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Registrants</h2>
          <p className="text-sm text-muted-foreground">
            {total} registered · {attendedCount} attended
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAddRegistrants && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add student
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add registrant</DialogTitle>
                  <DialogDescription>
                    Search by name, email, or student ID. Access rules are bypassed for admin adds.
                  </DialogDescription>
                </DialogHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-xl pl-9"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {searching && (
                    <div className="flex justify-center py-6">
                      <Spinner className="h-5 w-5" />
                    </div>
                  )}
                  {!searching && search.trim().length < 2 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Type at least 2 characters to search
                    </p>
                  )}
                  {!searching && search.trim().length >= 2 && candidates.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No matching students found
                    </p>
                  )}
                  {candidates.map((candidate) => (
                    <button
                      key={candidate.studentId}
                      type="button"
                      disabled={addingId === candidate.studentId}
                      onClick={() => addRegistrant(candidate)}
                      className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                    >
                      <div>
                        <p className="font-medium">{candidate.studentName}</p>
                        <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {candidate.uniqueStudentId ?? "—"}
                      </span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleExport}
            disabled={total === 0}
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchRegistrations}>
            Refresh
          </Button>
        </div>
      </div>

      {registrations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No registrations yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Student</th>
                  <th className="pb-2 pr-4 font-medium">ID</th>
                  <th className="pb-2 pr-4 font-medium">Registered</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{reg.studentName}</p>
                      <p className="text-xs text-muted-foreground">{reg.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {reg.uniqueStudentId ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {format(new Date(reg.registeredAt), "MMM d, yyyy · HH:mm")}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={reg.attended ? "default" : "outline"}>
                        {reg.attended ? "Attended" : "Not joined"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => toggleAttendance(reg)}
                      >
                        {reg.attended ? "Mark absent" : "Mark attended"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminListPagination
            page={page}
            pageSize={result?.pageSize ?? pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

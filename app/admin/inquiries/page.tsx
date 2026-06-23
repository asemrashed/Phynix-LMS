"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { api, ApiError } from "@/lib/api"
import type {
  ContactInquiryItem,
  InquiryStatus,
  PaginatedResult,
} from "@fxprime/types"
import { AdminListFilterSelect } from "@/components/admin/admin-list-filter-select"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { AdminListSearch } from "@/components/admin/admin-list-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUrlFilter } from "@/lib/use-admin-url-state"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
]

const SUBJECT_OPTIONS = [
  { value: "all", label: "All subjects" },
  { value: "GENERAL", label: "General" },
  { value: "COURSE", label: "Course" },
  { value: "PAYMENT", label: "Payment" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "PARTNERSHIP", label: "Partnership" },
]

const STATUS_COLORS: Record<InquiryStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-muted text-muted-foreground",
}

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

export default function AdminInquiriesPage() {
  const [result, setResult] = useState<PaginatedResult<ContactInquiryItem> | null>(null)
  const [selected, setSelected] = useState<ContactInquiryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [search, setSearch] = useUrlFilter("search", "")
  const [status, setStatus] = useUrlFilter("status", "all")
  const [subject, setSubject] = useUrlFilter("subject", "all")
  const [page, setPage] = useUrlFilter("page", "1")

  const pageNum = Math.max(1, Number(page) || 1)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set("search", search.trim())
      if (status !== "all") params.set("status", status)
      if (subject !== "all") params.set("subject", subject)
      params.set("page", String(pageNum))
      params.set("pageSize", "20")

      const data = await api<PaginatedResult<ContactInquiryItem>>(
        `/admin/inquiries?${params.toString()}`
      )
      setResult(data)
      setSelected((current) => {
        if (current) {
          return data.items.find((item) => item.id === current.id) ?? data.items[0] ?? null
        }
        return data.items[0] ?? null
      })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }, [search, status, subject, pageNum])

  useEffect(() => {
    const timer = setTimeout(fetchInquiries, 300)
    return () => clearTimeout(timer)
  }, [fetchInquiries])

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    setUpdating(true)
    try {
      const updated = await api<ContactInquiryItem>(`/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
      setSelected(updated)
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) => (item.id === updated.id ? updated : item)),
            }
          : prev
      )
      toast.success("Status updated")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact Inquiries</h1>
        <p className="text-sm text-muted-foreground">
          Messages submitted from the public contact form.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <AdminListSearch
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage("1")
          }}
          placeholder="Search name, email, or message..."
          className="sm:max-w-xs"
        />
        <AdminListFilterSelect
          value={status}
          onChange={(value) => {
            setStatus(value)
            setPage("1")
          }}
          options={STATUS_OPTIONS}
        />
        <AdminListFilterSelect
          value={subject}
          onChange={(value) => {
            setSubject(value)
            setPage("1")
          }}
          options={SUBJECT_OPTIONS}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-[20px] border bg-card">
            {loading && !result ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : result && result.items.length > 0 ? (
              <ul className="divide-y">
                {result.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className={cn(
                        "w-full px-4 py-4 text-left transition-colors hover:bg-muted/50",
                        selected?.id === item.id && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{item.name}</p>
                          <p className="truncate text-sm text-muted-foreground">{item.email}</p>
                        </div>
                        <Badge className={cn("shrink-0 capitalize", STATUS_COLORS[item.status])}>
                          {formatStatus(item.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {item.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.subjectLabel} · {format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-16 text-center text-sm text-muted-foreground">
                No inquiries found.
              </p>
            )}
          </div>

          {result && result.total > result.pageSize && (
            <AdminListPagination
              page={pageNum}
              pageSize={result.pageSize}
              total={result.total}
              onPageChange={(next) => setPage(String(next))}
              className="mt-4"
            />
          )}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-[20px] border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                  <a
                    href={`mailto:${selected.email}`}
                    className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <p className="mt-1 text-sm text-muted-foreground">{selected.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Select
                    value={selected.status}
                    onValueChange={(value) =>
                      handleStatusChange(selected.id, value as InquiryStatus)
                    }
                    disabled={updating}
                  >
                    <SelectTrigger className="w-40 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.filter((o) => o.value !== "all").map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary">{selected.subjectLabel}</Badge>
                <Badge variant="outline">
                  {format(new Date(selected.createdAt), "MMM d, yyyy · HH:mm")}
                </Badge>
                {selected.userId && <Badge variant="outline">Linked account</Badge>}
              </div>

              <div className="mt-6 rounded-xl bg-muted/40 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {selected.message}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <Button className="rounded-xl" asChild>
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subjectLabel}`}>
                    Reply via email
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-[20px] border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Select an inquiry to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

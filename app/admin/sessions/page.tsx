"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Search } from "lucide-react"
import type { AdminLiveSessionItem, SessionType } from "@fxprime/types"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { cn } from "@/lib/utils"

const SESSION_TYPES: SessionType[] = [
  "PUBLIC_WEBINAR",
  "COURSE_CLASS",
  "QA_SESSION",
  "GROUP_MENTORSHIP",
]

const STATUS_OPTIONS = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const

function statusBadgeClass(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-700"
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return ""
  }
}

export default function AdminSessionsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [type, setType] = useState<string>("all")

  const extraParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
    }),
    [search, status, type]
  )

  const { items: sessions, total, page, pageSize, loading, setPage, setPageSize } =
    useAdminPaginatedList<AdminLiveSessionItem>("/admin/sessions", { extraParams })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Sessions</h1>
        <div className="flex gap-2">
          <Link href="/admin/sessions/new">
            <Button className="rounded-xl">New Session</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl">Back</Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="rounded-xl pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {SESSION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-[20px] bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.scheduledAt), "MMM d, yyyy · HH:mm")} ·{" "}
                    {session.type.replace(/_/g, " ")} · {session.registrationCount} registered
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(statusBadgeClass(session.status))}
                  >
                    {session.status}
                  </Badge>
                  {session.isPublic && <Badge variant="secondary">Public</Badge>}
                  {session.requiresPremium && (
                    <Badge className="rounded-lg">PRO</Badge>
                  )}
                  {!session.requiresPremium && session.isPublic && (
                    <Badge variant="outline" className="rounded-lg">
                      Free
                    </Badge>
                  )}
                  <Link href={`/admin/sessions/${session.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No live sessions yet.</p>
            )}
          </div>

          <AdminListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  )
}

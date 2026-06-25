"use client"

import Link from "next/link"
import { useMemo } from "react"
import type { AdminUserItem } from "@fxprime/types"
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-data-table"
import { AdminListFilterSelect } from "@/components/admin/admin-list-filter-select"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { AdminListSearch } from "@/components/admin/admin-list-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { useUrlFilter } from "@/lib/use-admin-url-state"

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "STUDENT", label: "Student" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super admin" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useUrlFilter("search")
  const [role, setRole] = useUrlFilter("role", "all")
  const [status, setStatus] = useUrlFilter("status", "all")
  const extraParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      role: role !== "all" ? role : undefined,
      status: status !== "all" ? status : undefined,
    }),
    [search, role, status]
  )
  const { items: users, total, page, pageSize, loading, setPage, setPageSize } =
    useAdminPaginatedList<AdminUserItem>("/admin/users", { extraParams })

  return (
    <div>
      <AdminPageHeader
        title="Users"
        actions={
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl">
              Back
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <AdminListSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or student ID…"
          className="flex-1 max-w-none"
        />
        <AdminListFilterSelect
          value={role}
          onChange={setRole}
          options={ROLE_OPTIONS}
          placeholder="Role"
          className="w-full sm:w-[160px]"
        />
        <AdminListFilterSelect
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          placeholder="Status"
          className="w-full sm:w-[160px]"
        />
      </div>

      <AdminDataTable
        loading={loading}
        data={users}
        rowKey={(u) => u.id}
        emptyMessage="No users found."
        columns={[
          {
            key: "user",
            header: "User",
            cell: (u) => (
              <div>
                <p className="font-medium">{u.studentName || u.email}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                {u.uniqueStudentId && (
                  <p className="text-xs text-muted-foreground">{u.uniqueStudentId}</p>
                )}
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            cell: (u) => <Badge variant="outline">{u.role}</Badge>,
          },
          {
            key: "status",
            header: "Status",
            cell: (u) => (
              <Badge variant={u.isActive ? "default" : "destructive"}>
                {u.isActive ? "Active" : "Banned"}
              </Badge>
            ),
          },
        ]}
        actions={(u) => (
          <Link href={`/admin/users/${u.id}`}>
            <Button size="sm" variant="outline" className="rounded-xl">
              Manage
            </Button>
          </Link>
        )}
      />

      <AdminListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

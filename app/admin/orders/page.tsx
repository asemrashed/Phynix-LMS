"use client"

import Link from "next/link"
import { useMemo } from "react"
import { api, ApiError } from "@/lib/api"
import type { AdminOrderItem } from "@fxprime/types"
import { AdminOrderCard } from "@/components/admin/admin-order-card"
import { AdminListFilterSelect } from "@/components/admin/admin-list-filter-select"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { AdminListSearch } from "@/components/admin/admin-list-search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { useUrlFilter } from "@/lib/use-admin-url-state"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAYMENT_CONFIRMED", label: "Payment confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
]

function formatStatusLabel(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useUrlFilter("search")
  const [status, setStatus] = useUrlFilter("status", "all")
  const [from, setFrom] = useUrlFilter("from")
  const [to, setTo] = useUrlFilter("to")

  const extraParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status !== "all" ? status : undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [search, status, from, to]
  )

  const { items: orders, total, page, pageSize, loading, setPage, setPageSize, setItems } =
    useAdminPaginatedList<AdminOrderItem>("/admin/orders", { extraParams })

  const updateOrder = async (
    order: AdminOrderItem,
    nextStatus: string,
    extras?: { trackingNumber?: string; notes?: string }
  ) => {
    try {
      const updated = await api<AdminOrderItem>(`/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, ...extras }),
      })
      setItems((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
      toast.success(`Order marked as ${formatStatusLabel(nextStatus)}`)
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_TRANSITION") {
        toast.error(err.message)
      } else {
        toast.error("Failed to update order")
      }
      throw err
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/admin">
          <Button variant="outline" className="rounded-xl">Back</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <AdminListSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by order code, name, or email…"
          className="w-full max-w-none flex-1"
        />
        <AdminListFilterSelect
          value={status}
          onChange={setStatus}
          options={ORDER_STATUS_OPTIONS}
          placeholder="Status"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-auto">
            <Label htmlFor="from" className="text-xs text-muted-foreground">From</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Label htmlFor="to" className="text-xs text-muted-foreground">To</Label>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onUpdate={updateOrder}
              />
            ))}
            {orders.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
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

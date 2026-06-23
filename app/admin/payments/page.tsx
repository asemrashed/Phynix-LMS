"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatMoney } from "@/lib/money"
import type { AdminPaymentItem, RefundPaymentRequest } from "@fxprime/types"
import { AdminListFilterSelect } from "@/components/admin/admin-list-filter-select"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { AdminListSearch } from "@/components/admin/admin-list-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { useUrlFilter } from "@/lib/use-admin-url-state"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "AWAITING_VERIFICATION", label: "Awaiting verification" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REFUNDED", label: "Refunded" },
]

export default function AdminPaymentsPage() {
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

  const { items: payments, total, page, pageSize, loading, setPage, setPageSize, refetch } =
    useAdminPaginatedList<AdminPaymentItem>("/admin/payments", { extraParams })
  const [selected, setSelected] = useState<AdminPaymentItem | null>(null)
  const [refundType, setRefundType] = useState<"full" | "partial">("full")
  const [refundAmount, setRefundAmount] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const openRefund = (payment: AdminPaymentItem) => {
    setSelected(payment)
    setRefundType("full")
    setRefundAmount(String(payment.amount))
    setReason("")
  }

  const handleRefund = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const body: RefundPaymentRequest = {
        type: refundType,
        reason: reason.trim() || undefined,
      }
      if (refundType === "partial") {
        body.amount = Number(refundAmount)
      }

      await api(`/admin/payments/${selected.id}/refund`, {
        method: "POST",
        body: JSON.stringify(body),
      })

      await refetch()
      setSelected(null)
      toast.success(
        refundType === "full" ? "Full refund processed" : "Partial refund recorded"
      )
    } catch {
      toast.error("Refund failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments & Refunds</h1>
          <p className="text-sm text-muted-foreground">
            Issue full or partial refunds and revoke access when needed
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/payments/pending">
            <Button variant="outline" className="rounded-xl">
              Pending verification
            </Button>
          </Link>
          <Link href="/admin/payments/installments">
            <Button variant="outline" className="rounded-xl">
              Installment plans
            </Button>
          </Link>
          <Link href="/admin/payments/settings">
            <Button variant="outline" className="rounded-xl">
              Gateway settings
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <AdminListSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or transaction ID…"
          className="flex-1"
        />
        <AdminListFilterSelect
          value={status}
          onChange={setStatus}
          options={PAYMENT_STATUS_OPTIONS}
        />
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="from" className="text-xs text-muted-foreground">From</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
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
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-[20px] bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{payment.type}</Badge>
                      <Badge
                        variant={
                          payment.status === "REFUNDED" ? "destructive" : "default"
                        }
                      >
                        {payment.status}
                      </Badge>
                      {payment.refund && (
                        <Badge variant="secondary">
                          Refunded {formatMoney(payment.refund.amount, payment.currency)}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 font-medium">{payment.entityLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.studentName} · {payment.studentEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString()} ·{" "}
                      {payment.gateway}
                      {payment.tranId ? ` · ${payment.tranId}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {formatMoney(payment.amount, payment.currency)}
                    </p>
                    {payment.status === "COMPLETED" && !payment.refund && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 rounded-xl text-destructive hover:text-destructive"
                        onClick={() => openRefund(payment)}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-muted-foreground">No completed payments yet.</p>
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

      <AlertDialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process refund</AlertDialogTitle>
            <AlertDialogDescription>
              {selected && (
                <>
                  {selected.entityLabel} —{" "}
                  {formatMoney(selected.amount, selected.currency)} for{" "}
                  {selected.studentName}. Full refunds revoke access.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Refund type</Label>
              <Select
                value={refundType}
                onValueChange={(v) => {
                  const type = v as "full" | "partial"
                  setRefundType(type)
                  if (selected && type === "full") {
                    setRefundAmount(String(selected.amount))
                  }
                }}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full refund (revoke access)</SelectItem>
                  <SelectItem value="partial">Partial refund (keep access)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {refundType === "partial" && (
              <div>
                <Label htmlFor="refundAmount">Refund amount</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  min={0}
                  max={selected?.amount}
                  step="0.01"
                  className="mt-1 rounded-xl"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                className="mt-1 rounded-xl"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Customer request, duplicate charge, etc."
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className={cn("rounded-xl")}
              disabled={submitting}
              onClick={handleRefund}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Confirm Refund"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

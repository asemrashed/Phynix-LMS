"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatMoney } from "@/lib/money"
import type { AdminPendingPaymentItem } from "@fxprime/types"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"
import { Check, Loader2, X } from "lucide-react"

export default function AdminPendingPaymentsPage() {
  const { items: payments, total, page, pageSize, loading, setPage, setPageSize, refetch } =
    useAdminPaginatedList<AdminPendingPaymentItem>("/admin/payments/pending")
  const [selected, setSelected] = useState<AdminPendingPaymentItem | null>(null)
  const [action, setAction] = useState<"approve" | "reject">("approve")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const openAction = (payment: AdminPendingPaymentItem, next: "approve" | "reject") => {
    setSelected(payment)
    setAction(next)
    setReason("")
  }

  const handleConfirm = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      if (action === "approve") {
        await api(`/admin/payments/${selected.id}/approve`, { method: "POST" })
        toast.success("Payment approved")
      } else {
        await api(`/admin/payments/${selected.id}/reject`, {
          method: "POST",
          body: JSON.stringify({ reason: reason.trim() || undefined }),
        })
        toast.success("Payment rejected")
      }
      await refetch()
      setSelected(null)
    } catch {
      toast.error(action === "approve" ? "Approval failed" : "Rejection failed")
    } finally {
      setSubmitting(false)
    }
  }

  const dialogTitle = useMemo(
    () => (action === "approve" ? "Approve payment" : "Reject payment"),
    [action]
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pending Verification</h1>
          <p className="text-sm text-muted-foreground">
            Review bKash / Nagad proofs and approve or reject
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/payments">
            <Button variant="outline" className="rounded-xl">
              All payments
            </Button>
          </Link>
          <Link href="/admin/payments/settings">
            <Button variant="outline" className="rounded-xl">
              Gateway settings
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-[20px] bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{payment.gateway.toUpperCase()}</Badge>
                      <Badge>{payment.status.replaceAll("_", " ")}</Badge>
                      {payment.referenceCode && (
                        <Badge variant="secondary">{payment.referenceCode}</Badge>
                      )}
                    </div>
                    <p className="font-medium">{payment.entityLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.studentName} · {payment.studentEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sender: {payment.senderNumber || "—"} · Trx: {payment.customerTrxId || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted{" "}
                      {payment.submittedAt
                        ? new Date(payment.submittedAt).toLocaleString()
                        : new Date(payment.createdAt).toLocaleString()}
                    </p>
                    {payment.proofUrl && (
                      <div className="pt-2">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Payment proof</p>
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-white">
                            <Image
                              src={payment.proofUrl}
                              alt="Payment proof"
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className="text-xl font-bold">
                      {formatMoney(payment.amount, payment.currency)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl"
                        onClick={() => openAction(payment, "approve")}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-destructive hover:text-destructive"
                        onClick={() => openAction(payment, "reject")}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-muted-foreground">No payments awaiting verification.</p>
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
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {selected && (
                <>
                  {selected.entityLabel} — {formatMoney(selected.amount, selected.currency)} from{" "}
                  {selected.studentName}. Trx ID {selected.customerTrxId}.
                  {action === "approve" &&
                    " Approving will grant access immediately."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {action === "reject" && (
            <div className="py-2">
              <Label htmlFor="reject-reason">Reason</Label>
              <Textarea
                id="reject-reason"
                className="mt-1 rounded-xl"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Wrong amount, duplicate trx, etc."
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              className="rounded-xl"
              disabled={submitting}
              onClick={handleConfirm}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : dialogTitle}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

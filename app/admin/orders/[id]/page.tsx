"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import type { AdminOrderItem } from "@fxprime/types"
import { AdminOrderCard } from "@/components/admin/admin-order-card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

function formatStatusLabel(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<AdminOrderItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api<AdminOrderItem>(`/admin/orders/${orderId}`)
      .then(setOrder)
      .catch(() => router.replace("/admin/orders"))
      .finally(() => setLoading(false))
  }, [orderId, router])

  const updateOrder = async (
    nextStatus: string,
    extras?: { trackingNumber?: string; notes?: string }
  ) => {
    try {
      const updated = await api<AdminOrderItem>(`/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, ...extras }),
      })
      setOrder(updated)
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

  const saveMeta = async (extras: { trackingNumber?: string; notes?: string }) => {
    try {
      const updated = await api<AdminOrderItem>(`/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(extras),
      })
      setOrder(updated)
      toast.success("Order details saved")
    } catch {
      toast.error("Failed to save")
      throw new Error("save failed")
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api(`/admin/orders/${orderId}`, { method: "DELETE" })
      toast.success("Order deleted")
      router.push("/admin/orders")
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error("Failed to delete order")
      }
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const canDelete =
    order?.status === "PENDING" ||
    order?.status === "CANCELLED" ||
    order?.status === "RETURNED"

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Order {order.orderCode}</h1>
        </div>
        {canDelete && (
          <Button
            variant="outline"
            className="rounded-xl text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete order
          </Button>
        )}
      </div>

      <AdminOrderCard
        order={order}
        onUpdate={async (o, status, extras) => updateOrder(status, extras)}
        showMetaEditor
        onSaveMeta={saveMeta}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {order.orderCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the order record. Only pending, cancelled, or
              returned orders can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={handleDelete}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

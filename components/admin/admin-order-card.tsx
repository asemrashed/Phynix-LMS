"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import type { AdminOrderItem } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, MapPin, Package, Truck } from "lucide-react"
import { OrderWorkflow } from "@/components/orders/order-workflow"

const statusActions: Record<string, string[]> = {
  PENDING: ["CANCELLED"],
  PAYMENT_CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED", "CANCELLED"],
  DELIVERED: ["RETURNED"],
}

function formatStatusLabel(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

interface AdminOrderCardProps {
  order: AdminOrderItem
  onUpdate: (
    order: AdminOrderItem,
    status: string,
    extras?: { trackingNumber?: string; notes?: string }
  ) => Promise<void>
  showMetaEditor?: boolean
  onSaveMeta?: (extras: { trackingNumber?: string; notes?: string }) => Promise<void>
}

export function AdminOrderCard({
  order,
  onUpdate,
  showMetaEditor = false,
  onSaveMeta,
}: AdminOrderCardProps) {
  const [shipOpen, setShipOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "")
  const [notes, setNotes] = useState(order.notes ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [savingMeta, setSavingMeta] = useState(false)

  const paidOrder =
    order.paymentStatus === "COMPLETED" ||
    ["PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)

  useEffect(() => {
    setTrackingNumber(order.trackingNumber ?? "")
    setNotes(order.notes ?? "")
  }, [order.id, order.trackingNumber, order.notes])

  const actions = statusActions[order.status] || []
  const primary = actions.find((a) => !["CANCELLED", "RETURNED"].includes(a))
  const cancel = actions.includes("CANCELLED")
  const canReturn = actions.includes("RETURNED")

  const address = order.shippingAddress
  const addressLine = [address.address, address.city, address.district, address.postalCode]
    .filter(Boolean)
    .join(", ")

  const handlePrimary = async () => {
    if (!primary) return
    if (primary === "SHIPPED") {
      setTrackingNumber(order.trackingNumber ?? "")
      setNotes(order.notes ?? "")
      setShipOpen(true)
      return
    }
    setSubmitting(true)
    try {
      await onUpdate(order, primary)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShip = async () => {
    setSubmitting(true)
    try {
      await onUpdate(order, "SHIPPED", {
        trackingNumber: trackingNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      setShipOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    setSubmitting(true)
    try {
      await onUpdate(order, "CANCELLED")
      setCancelOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async () => {
    setSubmitting(true)
    try {
      await onUpdate(order, "RETURNED")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveMeta = async () => {
    if (!onSaveMeta) return
    setSavingMeta(true)
    try {
      await onSaveMeta({
        trackingNumber: trackingNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      })
    } finally {
      setSavingMeta(false)
    }
  }

  return (
    <>
      <div className="rounded-[20px] bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/admin/orders/${order.id}`}
              className="font-mono font-semibold hover:text-primary hover:underline"
            >
              {order.orderCode}
            </Link>
            {order.paymentId && (
              <Link
                href={`/admin/payments?search=${encodeURIComponent(order.paymentId)}`}
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View payment
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
          <span className="shrink-0 text-lg font-bold">
            ৳{order.total.toLocaleString()}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {order.studentName} · {order.studentEmail}
        </p>
        <p className="text-sm text-muted-foreground sm:text-xs">
          {format(new Date(order.createdAt), "MMM d, yyyy · HH:mm")}
        </p>

        <OrderWorkflow status={order.status} />

        {(order.trackingNumber || order.shippedAt) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {order.trackingNumber && (
              <Badge variant="outline" className="gap-1 rounded-lg">
                <Truck className="h-3.5 w-3.5" />
                {order.trackingNumber}
              </Badge>
            )}
            {order.shippedAt && (
              <span className="text-xs text-muted-foreground">
                Shipped {format(new Date(order.shippedAt), "MMM d, yyyy")}
              </span>
            )}
            {order.deliveredAt && (
              <span className="text-xs text-muted-foreground">
                · Delivered {format(new Date(order.deliveredAt), "MMM d, yyyy")}
              </span>
            )}
          </div>
        )}

        {addressLine && (
          <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Shipping address
            </div>
            <p>{address.name}</p>
            {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
            <p className="text-muted-foreground">{addressLine}</p>
          </div>
        )}

        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 shrink-0" />
              {item.name} × {item.quantity} — ৳{item.unitPrice}
            </li>
          ))}
        </ul>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Subtotal ৳{order.subtotal}</span>
          <span>Shipping ৳{order.shippingFee}</span>
          {order.notes && <span className="italic">Note: {order.notes}</span>}
        </div>

        {(primary || cancel || canReturn) && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {primary && (
              <Button
                className="min-h-11 w-full rounded-xl sm:w-auto"
                disabled={submitting}
                onClick={handlePrimary}
              >
                Mark as {formatStatusLabel(primary)}
              </Button>
            )}
            {canReturn && (
              <Button
                variant="outline"
                className="min-h-11 w-full rounded-xl sm:w-auto"
                disabled={submitting}
                onClick={handleReturn}
              >
                Mark returned
              </Button>
            )}
            {cancel && (
              <Button
                variant="outline"
                className="min-h-11 w-full rounded-xl text-destructive hover:text-destructive sm:w-auto"
                disabled={submitting}
                onClick={() => setCancelOpen(true)}
              >
                Cancel order
              </Button>
            )}
          </div>
        )}

        {showMetaEditor && onSaveMeta && (
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold">Edit details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`meta-tracking-${order.id}`}>Tracking number</Label>
                <Input
                  id={`meta-tracking-${order.id}`}
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`meta-notes-${order.id}`}>Internal notes</Label>
                <Textarea
                  id={`meta-notes-${order.id}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 rounded-xl"
                  rows={3}
                />
              </div>
            </div>
            <Button
              className="mt-4 rounded-xl"
              disabled={savingMeta}
              onClick={handleSaveMeta}
            >
              Save changes
            </Button>
          </div>
        )}
      </div>

      <Dialog open={shipOpen} onOpenChange={setShipOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`tracking-${order.id}`}>Tracking number</Label>
              <Input
                id={`tracking-${order.id}`}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Courier tracking ID"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor={`notes-${order.id}`}>Internal note (optional)</Label>
              <Textarea
                id={`notes-${order.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Courier name, batch info…"
                className="mt-1 rounded-xl"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShipOpen(false)}>
              Back
            </Button>
            <Button className="rounded-xl" disabled={submitting} onClick={handleShip}>
              Confirm shipped
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {order.orderCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              Stock will be restored if this order was already paid. The student will be
              notified.
              {paidOrder && order.paymentStatus !== "REFUNDED" && (
                <> A full refund will be processed automatically.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep order</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={submitting}
              onClick={handleCancel}
            >
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

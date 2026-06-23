"use client"

import Link from "next/link"
import { format } from "date-fns"
import type { OrderItem } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Package, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { OrderWorkflow } from "@/components/orders/order-workflow"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
}

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  PAYMENT_CONFIRMED: "bg-blue-500/10 text-blue-600",
  PROCESSING: "bg-purple-500/10 text-purple-600",
  SHIPPED: "bg-indigo-500/10 text-indigo-600",
  DELIVERED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-red-500/10 text-red-600",
  RETURNED: "bg-orange-500/10 text-orange-600",
}

interface OrderDetailViewProps {
  order: OrderItem
  backHref: string
  backLabel?: string
  actions?: React.ReactNode
  addressEditor?: React.ReactNode
}

export function OrderDetailView({
  order,
  backHref,
  backLabel = "Back to orders",
  actions,
  addressEditor,
}: OrderDetailViewProps) {
  const address = order.shippingAddress
  const addressLine = address
    ? [address.address, address.city, address.district, address.postalCode]
        .filter(Boolean)
        .join(", ")
    : ""

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {backLabel}
          </Link>
          <h1 className="mt-2 font-mono text-2xl font-bold">{order.orderCode}</h1>
        </div>
        <Badge className={cn("shrink-0", statusColor[order.status] || "")}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="rounded-[20px] bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Placed {format(new Date(order.createdAt), "MMM d, yyyy · HH:mm")}
        </div>

        <OrderWorkflow status={order.status} />

        {order.trackingNumber && (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Truck className="h-4 w-4" />
            Tracking: {order.trackingNumber}
          </p>
        )}

        {(order.shippedAt || order.deliveredAt) && (
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {order.shippedAt && (
              <p>Shipped {format(new Date(order.shippedAt), "MMM d, yyyy")}</p>
            )}
            {order.deliveredAt && (
              <p>Delivered {format(new Date(order.deliveredAt), "MMM d, yyyy")}</p>
            )}
          </div>
        )}

        {addressLine && (
          <div className="mt-4 rounded-xl bg-muted/40 p-4 text-sm">
            <div className="mb-1 flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Shipping address
            </div>
            {address?.name && <p>{address.name}</p>}
            {address?.phone && <p className="text-muted-foreground">{address.phone}</p>}
            <p className="text-muted-foreground">{addressLine}</p>
            {addressEditor}
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">{item.name}</span>
              <span className="text-muted-foreground">× {item.quantity}</span>
              <span className="font-medium">৳{item.unitPrice}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-sm">
          {order.subtotal != null && (
            <span className="text-muted-foreground">Subtotal ৳{order.subtotal}</span>
          )}
          {order.shippingFee != null && (
            <span className="text-muted-foreground">Shipping ৳{order.shippingFee}</span>
          )}
          <span className="ml-auto text-lg font-bold">Total ৳{order.total}</span>
        </div>

        {actions && <div className="mt-6 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}

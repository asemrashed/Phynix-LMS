"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { OrderItem, PhysicalProductItem } from "@fxprime/types"
import { Package, ShoppingBag, Truck } from "lucide-react"
import Link from "next/link"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [physicalProducts, setPhysicalProducts] = useState<PhysicalProductItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderData, productData] = await Promise.all([
          api<OrderItem[]>("/products/orders/me"),
          api<PhysicalProductItem[]>("/products/physical"),
        ])
        setOrders(orderData)
        setPhysicalProducts(productData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-600",
    PAYMENT_CONFIRMED: "bg-blue-500/10 text-blue-600",
    PROCESSING: "bg-purple-500/10 text-purple-600",
    SHIPPED: "bg-indigo-500/10 text-indigo-600",
    DELIVERED: "bg-green-500/10 text-green-600",
    CANCELLED: "bg-red-500/10 text-red-600",
    RETURNED: "bg-orange-500/10 text-orange-600",
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Orders</h1>
        <p className="text-muted-foreground">Track your physical product orders</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold">My Orders</h2>
            {orders.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingBag />
                  </EmptyMedia>
                  <EmptyTitle>No orders yet</EmptyTitle>
                  <EmptyDescription>
                    Physical product orders will appear here once placed.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-[20px] bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/order/${order.id}`}
                        className="font-mono text-sm font-medium hover:text-primary hover:underline"
                      >
                        {order.orderCode}
                      </Link>
                      <Badge className={statusColor[order.status] || ""}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.trackingNumber && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-primary">
                        <Truck className="h-4 w-4" />
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                    <ul className="mt-3 space-y-1 text-sm">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <Package className="h-3.5 w-3.5" />
                          {item.name} × {item.quantity} — ৳{item.unitPrice}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {order.subtotal != null && <span>Subtotal ৳{order.subtotal}</span>}
                      {order.shippingFee != null && <span>Shipping ৳{order.shippingFee}</span>}
                    </div>
                    <p className="mt-2 font-bold">Total: ৳{order.total}</p>
                    <Link href={`/order/${order.id}`}>
                      <Button size="sm" variant="outline" className="mt-3 rounded-xl">
                        View details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Available Products</h2>
            <div className="space-y-4">
              {physicalProducts.map((product) => (
                <div key={product.id} className="flex gap-4 rounded-[20px] bg-card p-4 shadow-sm">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <p className="mt-1 font-bold text-primary">৳{product.price}</p>
                    <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                    {product.stock > 0 && (
                      <Link href={`/checkout/product?productId=${product.id}`}>
                        <Button size="sm" className="mt-2 rounded-xl">Buy Now</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

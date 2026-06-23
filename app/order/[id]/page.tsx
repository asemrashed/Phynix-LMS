"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import type { OrderItem, OrderShippingAddress } from "@fxprime/types"
import { OrderDetailView } from "@/components/orders/order-detail-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const emptyAddress = (): OrderShippingAddress => ({
  name: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  postalCode: "",
})

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState<OrderShippingAddress>(emptyAddress())
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    api<OrderItem>(`/products/orders/me/${orderId}`)
      .then(setOrder)
      .catch(() => router.replace("/dashboard/orders"))
      .finally(() => setLoading(false))
  }, [orderId, router])

  const canCancel =
    order?.status === "PENDING" || order?.status === "PAYMENT_CONFIRMED"

  const canEditAddress = order?.status === "PENDING"

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const updated = await api<OrderItem>(`/products/orders/me/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "cancel" }),
      })
      setOrder(updated)
      toast.success("Order cancelled")
      setCancelOpen(false)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error("Could not cancel order")
      }
    } finally {
      setCancelling(false)
    }
  }

  const startEditAddress = () => {
    setAddressForm(order?.shippingAddress ?? emptyAddress())
    setEditingAddress(true)
  }

  const handleSaveAddress = async () => {
    setSavingAddress(true)
    try {
      const updated = await api<OrderItem>(`/products/orders/me/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ shippingAddress: addressForm }),
      })
      setOrder(updated)
      setEditingAddress(false)
      toast.success("Shipping address updated")
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error("Could not update address")
      }
    } finally {
      setSavingAddress(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!order) return null

  return (
    <>
      <OrderDetailView
        order={order}
        backHref="/dashboard/orders"
        actions={
          canCancel ? (
            <Button
              variant="outline"
              className="rounded-xl text-destructive hover:text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              Cancel order
            </Button>
          ) : undefined
        }
        addressEditor={
          canEditAddress ? (
            editingAddress ? (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="addr-name">Name</Label>
                    <Input
                      id="addr-name"
                      value={addressForm.name}
                      onChange={(e) =>
                        setAddressForm((a) => ({ ...a, name: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-phone">Phone</Label>
                    <Input
                      id="addr-phone"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm((a) => ({ ...a, phone: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="addr-line">Address</Label>
                    <Input
                      id="addr-line"
                      value={addressForm.address}
                      onChange={(e) =>
                        setAddressForm((a) => ({ ...a, address: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-city">City</Label>
                    <Input
                      id="addr-city"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((a) => ({ ...a, city: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-district">District</Label>
                    <Input
                      id="addr-district"
                      value={addressForm.district}
                      onChange={(e) =>
                        setAddressForm((a) => ({ ...a, district: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-postal">Postal code</Label>
                    <Input
                      id="addr-postal"
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm((a) => ({ ...a, postalCode: e.target.value }))
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="rounded-xl"
                    disabled={savingAddress}
                    onClick={handleSaveAddress}
                  >
                    Save address
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setEditingAddress(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-xl"
                onClick={startEditAddress}
              >
                Edit shipping address
              </Button>
            )
          ) : undefined
        }
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              {order.status === "PAYMENT_CONFIRMED"
                ? "Your order will be cancelled, stock released, and a full refund processed to your original payment method."
                : "This unpaid order will be cancelled. You can place a new order anytime."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep order</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelling}
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

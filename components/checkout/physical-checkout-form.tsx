"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { PaymentGatewayPicker } from "@/components/checkout/payment-gateway-picker"
import { PaymentUnavailableAlert } from "@/components/checkout/payment-unavailable-alert"
import { usePaymentConfig } from "@/hooks/use-payment-config"
import { calcShipping } from "@/stores/cart-store"
import { api } from "@/lib/api"
import { isManualPaymentGateway, processPayment } from "@/lib/payment"
import { useAuth } from "@/lib/auth-context"
import { getMediaUrl } from "@/lib/media-url"
import { getOrdersPath, getSettingsPath } from "@/lib/get-default-panel"
import { handleVerificationError, needsEmailVerification } from "@/lib/verification"
import type { CartCheckoutResult, SavedAddressItem } from "@fxprime/types"
import { Loader2, MapPin, Package, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface PhysicalCheckoutLineItem {
  productId: string
  slug?: string
  title: string
  price: number
  currency: string
  quantity: number
  stock: number
  thumbnailUrl?: string | null
}

interface PhysicalCheckoutFormProps {
  items: PhysicalCheckoutLineItem[]
  editableQuantities?: boolean
  onQuantityChange?: (productId: string, quantity: number) => void
  onSuccess?: (result: CartCheckoutResult) => void
  className?: string
}

function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString()}`
}

export function PhysicalCheckoutForm({
  items,
  editableQuantities = false,
  onQuantityChange,
  onSuccess,
  className,
}: PhysicalCheckoutFormProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [addresses, setAddresses] = useState<SavedAddressItem[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("new")
  const [saveAddress, setSaveAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState("Home")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("Dhaka")
  const [postalCode, setPostalCode] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    config,
    loading: configLoading,
    error: configError,
    gateway,
    setGateway,
    availableGateways,
    allowUserChoice,
  } = usePaymentConfig()

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const shipping = calcShipping(subtotal)
  const total = subtotal + shipping

  const applyAddress = (addr: SavedAddressItem) => {
    setName(addr.name)
    setPhone(addr.phone)
    setAddress(addr.address)
    setCity(addr.city)
    setPostalCode(addr.postalCode || "")
  }

  useEffect(() => {
    if (!user) return
    if (user.student) {
      setName(`${user.student.firstName} ${user.student.lastName}`)
      setPhone(user.student.phone || "")
    }
    api<SavedAddressItem[]>("/students/me/addresses")
      .then((data) => {
        setAddresses(data)
        const defaultAddr = data.find((a) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
          applyAddress(defaultAddr)
        }
      })
      .catch(() => {})
  }, [user])

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id)
    if (id === "new") return
    const found = addresses.find((a) => a.id === id)
    if (found) applyAddress(found)
  }

  const canSubmit =
    Boolean(name.trim() && phone.trim() && address.trim() && city.trim()) &&
    items.length > 0 &&
    !needsEmailVerification(user) &&
    availableGateways.length > 0

  const handleCheckout = async () => {
    if (!user || items.length === 0 || !canSubmit) return
    setLoading(true)
    try {
      const shippingAddress = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim() || undefined,
      }

      if (saveAddress && selectedAddressId === "new") {
        await api<SavedAddressItem>("/students/me/addresses", {
          method: "POST",
          body: JSON.stringify({
            label: addressLabel,
            ...shippingAddress,
            isDefault: addresses.length === 0,
          }),
        })
      }

      const result = await api<CartCheckoutResult>("/products/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress,
          gateway,
        }),
      })

      if (result.requiresPayment && result.checkoutUrl) {
        const redirected = await processPayment({
          paymentId: result.paymentId || result.sessionId,
          checkoutUrl: result.checkoutUrl,
          gateway: result.gateway ?? gateway,
          manual: result.manual,
          requiresPayment: true,
        })
        if (redirected) return
      }

      onSuccess?.(result)
      toast.success(
        result.orderCode
          ? `Order ${result.orderCode} placed!`
          : "Order placed successfully!"
      )
      router.push(getOrdersPath(user.role))
    } catch (err) {
      if (
        handleVerificationError(err, () => {
          toast.error("Verify your email before checkout")
          router.push(getSettingsPath(user?.role))
        })
      ) {
        return
      }
      toast.error("Checkout failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <EmailVerificationBanner compact />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
        <section className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order Summary
            </h2>

            <ul className="space-y-4">
              {items.map((item) => {
                const imageSrc = getMediaUrl(item.thumbnailUrl)
                return (
                  <li
                    key={item.productId}
                    className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSrc}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatBdt(item.price)} each
                      </p>
                      {editableQuantities && onQuantityChange ? (
                        <div className="mt-3 max-w-[120px]">
                          <Label htmlFor={`qty-${item.productId}`} className="sr-only">
                            Quantity
                          </Label>
                          <Input
                            id={`qty-${item.productId}`}
                            type="number"
                            min={1}
                            max={item.stock}
                            className="rounded-xl"
                            value={item.quantity}
                            onChange={(e) =>
                              onQuantityChange(
                                item.productId,
                                Math.min(item.stock, Math.max(1, Number(e.target.value)))
                              )
                            }
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      )}
                      <p className="mt-2 font-semibold text-primary">
                        {formatBdt(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBdt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatBdt(shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatBdt(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <Package className="h-4 w-4 shrink-0" />
            Free shipping on orders over ৳1,000
          </div>
        </section>

        <section className="space-y-6 rounded-[20px] border border-border bg-card p-6 shadow-sm">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </h2>

            {addresses.length > 0 && (
              <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                <SelectTrigger className="mb-4 rounded-xl">
                  <SelectValue placeholder="Select saved address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      {addr.label} — {addr.address}, {addr.city}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">Use a new address</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="checkout-name">Full Name</Label>
                <Input
                  id="checkout-name"
                  className="mt-1 rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="checkout-phone">Phone</Label>
                <Input
                  id="checkout-phone"
                  className="mt-1 rounded-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="checkout-address">Address</Label>
                <Input
                  id="checkout-address"
                  className="mt-1 rounded-xl"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="checkout-city">City</Label>
                  <Input
                    id="checkout-city"
                    className="mt-1 rounded-xl"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout-postal">Postal Code</Label>
                  <Input
                    id="checkout-postal"
                    className="mt-1 rounded-xl"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {selectedAddressId === "new" && (
                <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="saveAddress"
                      checked={saveAddress}
                      onCheckedChange={(v) => setSaveAddress(v === true)}
                    />
                    <Label htmlFor="saveAddress" className="text-sm font-normal">
                      Save this address for future orders
                    </Label>
                  </div>
                  {saveAddress && (
                    <div>
                      <Label htmlFor="addressLabel">Address Label</Label>
                      <Input
                        id="addressLabel"
                        className="mt-1 rounded-xl"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        placeholder="Home, Office..."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {availableGateways.length === 0 ? (
              <PaymentUnavailableAlert configError={configError} />
            ) : config ? (
              <PaymentGatewayPicker
                gateways={config.gateways}
                value={gateway}
                onChange={setGateway}
                allowUserChoice={allowUserChoice}
              />
            ) : null}
          </div>

          <Button
            className="w-full rounded-xl"
            size="lg"
            disabled={loading || !canSubmit}
            onClick={handleCheckout}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isManualPaymentGateway(gateway) ? (
              `Continue to ${gateway === "bkash" ? "bKash" : "Nagad"} — ${formatBdt(total)}`
            ) : (
              `Pay ${formatBdt(total)}`
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secure payment through your selected gateway
          </p>
        </section>
      </div>
    </div>
  )
}

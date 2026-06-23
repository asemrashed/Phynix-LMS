"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckoutShell } from "@/components/checkout/checkout-shell"
import { CheckoutPageContainer } from "@/components/checkout/checkout-page-container"
import { PhysicalCheckoutForm } from "@/components/checkout/physical-checkout-form"
import { useCartStore } from "@/stores/cart-store"
import { useAuth } from "@/lib/auth-context"
import { ChevronLeft } from "lucide-react"

export default function CartCheckoutPage() {
  const { user } = useAuth()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  if (!user) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="py-16 text-center">
          <p>Please login to checkout</p>
          <Link href="/login">
            <Button className="mt-4 rounded-xl">Login</Button>
          </Link>
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  if (items.length === 0) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="py-16 text-center">
          <p>Your cart is empty</p>
          <Link href="/marketplace">
            <Button className="mt-4 rounded-xl">Browse Marketplace</Button>
          </Link>
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  const lineItems = items.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    title: item.title,
    price: item.price,
    currency: item.currency,
    quantity: item.quantity,
    stock: item.stock,
    thumbnailUrl: item.thumbnailUrl,
  }))

  return (
    <CheckoutShell>
      <CheckoutPageContainer>
        <Link href="/cart">
          <Button variant="ghost" size="sm" className="mb-6 rounded-xl">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Checkout</h1>

        <PhysicalCheckoutForm
          items={lineItems}
          onSuccess={() => clearCart()}
        />
      </CheckoutPageContainer>
    </CheckoutShell>
  )
}

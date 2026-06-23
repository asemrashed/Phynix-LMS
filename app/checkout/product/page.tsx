"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckoutShell } from "@/components/checkout/checkout-shell"
import { CheckoutPageContainer } from "@/components/checkout/checkout-page-container"
import {
  PhysicalCheckoutForm,
  type PhysicalCheckoutLineItem,
} from "@/components/checkout/physical-checkout-form"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { PhysicalProductItem } from "@fxprime/types"
import { ChevronLeft, Loader2 } from "lucide-react"

function ProductCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const productId = searchParams.get("productId")
  const [product, setProduct] = useState<PhysicalProductItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!productId) {
      setFetching(false)
      return
    }
    api<PhysicalProductItem>(`/products/physical/${productId}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setFetching(false))
  }, [productId])

  const lineItems: PhysicalCheckoutLineItem[] = useMemo(() => {
    if (!product) return []
    return [
      {
        productId: product.id,
        slug: product.slug,
        title: product.name,
        price: product.price,
        currency: product.currency,
        quantity,
        stock: product.stock,
        thumbnailUrl: product.images[0] ?? null,
      },
    ]
  }, [product, quantity])

  if (fetching) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  if (!productId || !product) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="py-16 text-center">
          <p>Product not found</p>
          <Button className="mt-4 rounded-xl" onClick={() => router.push("/marketplace")}>
            Browse products
          </Button>
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  if (!user) {
    const loginHref = `/login?redirect=${encodeURIComponent(`/checkout/product?productId=${productId}`)}`
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="py-16 text-center">
          <p>Please login to place an order</p>
          <Link href={loginHref}>
            <Button className="mt-4 rounded-xl">Login</Button>
          </Link>
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  if (product.stock <= 0) {
    return (
      <CheckoutShell>
        <CheckoutPageContainer className="py-16 text-center">
          <p>This product is out of stock</p>
          <Link href={`/marketplace/physical/${product.slug}`}>
            <Button className="mt-4 rounded-xl">Back to product</Button>
          </Link>
        </CheckoutPageContainer>
      </CheckoutShell>
    )
  }

  return (
    <CheckoutShell>
      <CheckoutPageContainer>
        <Link href={`/marketplace/physical/${product.slug}`}>
          <Button variant="ghost" size="sm" className="mb-6 rounded-xl">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to product
          </Button>
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Checkout</h1>

        <PhysicalCheckoutForm
          items={lineItems}
          editableQuantities
          onQuantityChange={(_productId, nextQty) => setQuantity(nextQty)}
        />
      </CheckoutPageContainer>
    </CheckoutShell>
  )
}

export default function ProductCheckoutPage() {
  return (
    <Suspense
      fallback={
        <CheckoutShell>
          <CheckoutPageContainer className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CheckoutPageContainer>
        </CheckoutShell>
      }
    >
      <ProductCheckoutContent />
    </Suspense>
  )
}

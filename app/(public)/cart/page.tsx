"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { calcShipping, useCartStore } from "@/stores/cart-store"
import { getMediaUrl } from "@/lib/media-url"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.subtotal())
  const shipping = calcShipping(subtotal)
  const total = subtotal + shipping

  return (
    <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="rounded-[20px] bg-card p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Link href="/marketplace">
              <Button className="mt-6 rounded-xl">Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const thumb = getMediaUrl(item.thumbnailUrl)
                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 rounded-[20px] border border-border bg-card p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <Link
                        href={`/marketplace/physical/${item.slug}`}
                        className="font-semibold hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-primary font-medium">
                        ৳{item.price.toLocaleString()}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.productId,
                                Number(e.target.value) || 1
                              )
                            }
                            className="h-8 w-14 rounded-lg text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="h-fit rounded-[20px] border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `৳${shipping}`}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{total.toLocaleString()}</span>
                </div>
              </div>
              <Link href="/checkout/cart">
                <Button className="mt-6 w-full rounded-xl" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Free shipping on orders over ৳1,000
              </p>
            </div>
          </div>
        )}
    </main>
  )
}

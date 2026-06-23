"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api, getAccessToken } from "@/lib/api"
import { resolveApiUrl } from "@/lib/api-url"
import { createSSLPayment, processPayment } from "@/lib/payment"
import type { DigitalProductItem, ProductPurchaseItem } from "@fxprime/types"
import { Download, Package, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { handleVerificationError } from "@/lib/verification"

export default function ProductsPage() {
  const [products, setProducts] = useState<DigitalProductItem[]>([])
  const [purchases, setPurchases] = useState<ProductPurchaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"store" | "library">("store")

  useEffect(() => {
    async function fetchData() {
      try {
        const [productData, purchaseData] = await Promise.all([
          api<DigitalProductItem[]>("/products/digital"),
          api<ProductPurchaseItem[]>("/products/digital/purchases/me"),
        ])
        setProducts(productData)
        setPurchases(purchaseData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handlePurchase(productId: string, price: number) {
    try {
      if (price === 0) {
        await api(`/products/digital/${productId}/purchase`, { method: "POST", body: JSON.stringify({}) })
      } else {
        const result = await createSSLPayment({ type: "digital_product", productId })
        const redirected = await processPayment(result)
        if (redirected) return
      }
      const [productData, purchaseData] = await Promise.all([
        api<DigitalProductItem[]>("/products/digital"),
        api<ProductPurchaseItem[]>("/products/digital/purchases/me"),
      ])
      setProducts(productData)
      setPurchases(purchaseData)
    } catch (err) {
      if (
        handleVerificationError(err, () => {
          toast.error("Verify your email before purchasing")
        })
      ) {
        return
      }
      toast.error("Purchase failed")
      console.error(err)
    }
  }

  async function handleDownload(productId: string) {
    const token = getAccessToken()
    const res = await fetch(resolveApiUrl(`/products/digital/${productId}/download`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "download"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Digital Products</h1>
        <p className="text-muted-foreground">Trading tools, journals, and educational resources</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={tab === "store" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setTab("store")}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Store
        </Button>
        <Button
          variant={tab === "library" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setTab("library")}
        >
          <Package className="mr-2 h-4 w-4" />
          My Library ({purchases.length})
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tab === "store" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-[20px] bg-card p-6 shadow-sm">
              {product.thumbnailUrl && (
                <img
                  src={product.thumbnailUrl}
                  alt={product.title}
                  className="mb-4 h-40 w-full rounded-xl object-cover"
                />
              )}
              <Badge variant="outline" className="mb-2">
                {product.type}
              </Badge>
              <h3 className="font-bold text-foreground">{product.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {product.price === 0 ? "Free" : `৳${product.price.toLocaleString()}`}
                </span>
                {product.isPurchased ? (
                  <Badge>Owned</Badge>
                ) : (
                  <Button
                    className="rounded-xl"
                    size="sm"
                    onClick={() => handlePurchase(product.id, product.price)}
                  >
                    {product.price === 0 ? "Get Free" : "Buy Now"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <p className="text-muted-foreground">No products in your library yet.</p>
          ) : (
            purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between rounded-[20px] bg-card p-6 shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-foreground">{purchase.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {purchase.type} · Downloaded {purchase.downloadCount}/{purchase.maxDownloads} times
                  </p>
                </div>
                <Button
                  className="rounded-xl"
                  size="sm"
                  onClick={() => handleDownload(purchase.productId)}
                  disabled={purchase.downloadCount >= purchase.maxDownloads}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

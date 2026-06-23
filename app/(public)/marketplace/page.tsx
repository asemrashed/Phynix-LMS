"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/marketplace/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, Store } from "lucide-react"
import type { MarketplaceCatalog, MarketplaceProductItem } from "@fxprime/types"
import { api } from "@/lib/api"

function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const freeOnly = searchParams.get("free") === "true"
  const initialType = searchParams.get("type")
  const initialTypeValue =
    initialType === "digital" || initialType === "physical" ? initialType : "all"

  const [products, setProducts] = useState<MarketplaceProductItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [type, setType] = useState<"all" | "digital" | "physical">(
    freeOnly ? "digital" : initialTypeValue
  )
  const [category, setCategory] = useState(searchParams.get("category") ?? "all")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest")

  const syncFiltersToUrl = useCallback(
    (overrides?: Partial<{ search: string; type: string; category: string; sort: string }>) => {
      const params = new URLSearchParams()
      if (freeOnly) params.set("free", "true")
      const nextSearch = overrides?.search ?? search
      const nextType = overrides?.type ?? type
      const nextCategory = overrides?.category ?? category
      const nextSort = overrides?.sort ?? sort
      if (nextSearch.trim()) params.set("search", nextSearch.trim())
      if (!freeOnly && nextType !== "all") params.set("type", nextType)
      if (nextCategory !== "all") params.set("category", nextCategory)
      if (nextSort !== "newest") params.set("sort", nextSort)
      const query = params.toString()
      router.replace(query ? `/marketplace?${query}` : "/marketplace", { scroll: false })
    },
    [category, freeOnly, router, search, sort, type]
  )

  const fetchCatalog = useCallback(
    async (cursor?: string | null, append = false) => {
      if (append) setLoadingMore(true)
      else setLoading(true)

      try {
        const params = new URLSearchParams()
        if (type !== "all") params.set("type", type)
        if (category !== "all") params.set("category", category)
        if (sort !== "newest") params.set("sort", sort)
        if (freeOnly) params.set("free", "true")
        if (search.trim()) params.set("search", search.trim())
        if (cursor) params.set("cursor", cursor)
        params.set("limit", "24")

        const data = await api<MarketplaceCatalog>(
          `/products/marketplace?${params.toString()}`
        )

        setProducts((prev) => (append ? [...prev, ...data.products] : data.products))
        setCategories(data.categories)
        setTotal(data.total)
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [category, freeOnly, search, sort, type]
  )

  useEffect(() => {
    if (freeOnly) setType("digital")
  }, [freeOnly])

  useEffect(() => {
    fetchCatalog(null, false)
  }, [fetchCatalog])

  useEffect(() => {
    const timer = setTimeout(() => syncFiltersToUrl(), 300)
    return () => clearTimeout(timer)
  }, [search, type, category, sort, syncFiltersToUrl])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Store className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">IELTS Store</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {freeOnly ? "Free Ebooks & Resources" : "Marketplace"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {freeOnly
              ? "Download free study guides, practice materials, and educational PDFs"
              : "Digital study tools, practice books, and physical learning resources"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${total} products`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="rounded-xl pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!freeOnly && (
            <Tabs
              value={type}
              onValueChange={(v) => {
                setType(v as typeof type)
                setCategory("all")
              }}
            >
              <TabsList className="rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">
                  All
                </TabsTrigger>
                <TabsTrigger value="digital" className="rounded-lg">
                  Digital
                </TabsTrigger>
                <TabsTrigger value="physical" className="rounded-lg">
                  Physical
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-36 rounded-xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low</SelectItem>
              <SelectItem value="price_desc">Price: High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[20px] bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[20px] bg-card p-12 text-center">
          <p className="text-muted-foreground">No products match your filters.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={() => {
              setSearch("")
              if (!freeOnly) setType("all")
              setCategory("all")
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={`${product.productType}-${product.id}`} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={loadingMore}
                onClick={() => fetchCatalog(nextCursor, true)}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[20px] bg-muted" />
            ))}
          </div>
        </main>
      }
    >
      <MarketplaceContent />
    </Suspense>
  )
}

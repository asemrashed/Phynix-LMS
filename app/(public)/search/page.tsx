"use client"

import { useEffect, useState, FormEvent, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchResultCard } from "@/components/search/search-result-card"
import { api } from "@/lib/api"
import type { SearchResponse } from "@fxprime/types"
import { Search } from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState("all")
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    async function runSearch() {
      const q = initialQuery.trim()
      if (q.length < 2) {
        setResults(null)
        return
      }

      setLoading(true)
      try {
        const data = await api<SearchResponse>(
          `/search?q=${encodeURIComponent(q)}&type=all`
        )
        setResults(data)
      } catch (err) {
        console.error(err)
        setResults(null)
      } finally {
        setLoading(false)
      }
    }
    runSearch()
  }, [initialQuery])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const courses = results?.courses ?? []
  const blog = results?.blog ?? []
  const products = results?.products ?? []
  const total = results?.total ?? 0

  function renderList(items: typeof courses, emptyLabel: string) {
    if (loading) {
      return <p className="text-muted-foreground">Searching...</p>
    }
    if (!initialQuery.trim() || initialQuery.trim().length < 2) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>Start searching</EmptyTitle>
            <EmptyDescription>
              Enter at least 2 characters to search courses, blog posts, and products.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    if (items.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No results</EmptyTitle>
            <EmptyDescription>
              No {emptyLabel} matched &ldquo;{initialQuery}&rdquo;. Try different keywords.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Search</h1>
          <p className="mt-2 text-muted-foreground">
            Find courses, blog articles, and marketplace products
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, blog, products..."
              className="pl-9"
            />
          </div>
          <Button type="submit" className="rounded-xl">
            Search
          </Button>
        </form>

        {initialQuery.trim().length >= 2 && !loading && results && (
          <p className="mb-4 text-sm text-muted-foreground">
            {total} result{total === 1 ? "" : "s"} for &ldquo;{results.query}&rdquo;
          </p>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">
              All ({total})
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg">
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg">
              Blog ({blog.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg">
              Products ({products.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderList([...courses, ...blog, ...products], "results")}
          </TabsContent>
          <TabsContent value="courses">{renderList(courses, "courses")}</TabsContent>
          <TabsContent value="blog">{renderList(blog, "blog posts")}</TabsContent>
          <TabsContent value="products">{renderList(products, "products")}</TabsContent>
        </Tabs>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="container mx-auto px-4 py-8" />}>
      <SearchPageContent />
    </Suspense>
  )
}

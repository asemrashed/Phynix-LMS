"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import { parsePage, parsePageSize } from "@/lib/pagination-utils"
import type { PaginatedResult } from "@fxprime/types"
import { toast } from "sonner"

const DEFAULT_PAGE_SIZE = 20

export interface UseAdminPaginatedListOptions {
  pageSize?: number
  extraParams?: Record<string, string | undefined>
  enabled?: boolean
  syncUrl?: boolean
  onError?: (message: string) => void
}

export function useAdminPaginatedList<T>(
  path: string,
  options: UseAdminPaginatedListOptions = {}
) {
  const syncUrl = options.syncUrl ?? true
  const enabled = options.enabled ?? true
  const extraParams = options.extraParams ?? {}
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const extraKey = useMemo(() => JSON.stringify(extraParams), [extraParams])

  const [page, setPageState] = useState(() =>
    syncUrl ? parsePage(searchParams.get("page")) : 1
  )
  const [pageSize, setPageSizeState] = useState(() =>
    syncUrl
      ? parsePageSize(searchParams.get("pageSize"), options.pageSize ?? DEFAULT_PAGE_SIZE)
      : (options.pageSize ?? DEFAULT_PAGE_SIZE)
  )
  const [result, setResult] = useState<PaginatedResult<T> | null>(null)
  const [loading, setLoading] = useState(true)

  const syncToUrl = useCallback(
    (nextPage: number, nextPageSize: number) => {
      if (!syncUrl) return
      const params = new URLSearchParams(searchParams.toString())
      if (nextPage <= 1) params.delete("page")
      else params.set("page", String(nextPage))
      if (nextPageSize === DEFAULT_PAGE_SIZE) params.delete("pageSize")
      else params.set("pageSize", String(nextPageSize))
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams, syncUrl]
  )

  const setPage = useCallback(
    (next: number | ((prev: number) => number)) => {
      setPageState((prev) => {
        const value = typeof next === "function" ? next(prev) : next
        syncToUrl(value, pageSize)
        return value
      })
    },
    [pageSize, syncToUrl]
  )

  const setPageSize = useCallback(
    (next: number) => {
      setPageSizeState(next)
      setPageState(1)
      syncToUrl(1, next)
    },
    [syncToUrl]
  )

  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    setPageState(1)
    if (syncUrl) syncToUrl(1, pageSize)
  }, [extraKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!syncUrl) return
    setPageState(parsePage(searchParams.get("page")))
    setPageSizeState(parsePageSize(searchParams.get("pageSize"), options.pageSize ?? DEFAULT_PAGE_SIZE))
  }, [searchParams, syncUrl, options.pageSize])

  const refetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("pageSize", String(pageSize))
      for (const [key, value] of Object.entries(extraParams)) {
        if (value) params.set(key, value)
      }
      const query = params.toString()
      const data = await api<PaginatedResult<T>>(query ? `${path}?${query}` : path)
      setResult(data)

      const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
      if (data.items.length === 0 && data.total > 0 && page > totalPages) {
        setPage(totalPages)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load data"
      if (options.onError) {
        options.onError(message)
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [path, page, pageSize, extraKey, enabled, options.onError, setPage])

  useEffect(() => {
    refetch()
  }, [refetch])

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  return {
    items: result?.items ?? [],
    total: result?.total ?? 0,
    page,
    pageSize: result?.pageSize ?? pageSize,
    totalPages,
    loading,
    setPage,
    setPageSize,
    setItems: (updater: T[] | ((prev: T[]) => T[])) => {
      setResult((prev) => {
        if (!prev) return prev
        const items = typeof updater === "function" ? updater(prev.items) : updater
        return { ...prev, items }
      })
    },
    refetch,
  }
}

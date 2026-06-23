"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function useAdminUrlState() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const getParam = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams]
  )

  const setParams = useCallback(
    (updates: Record<string, string | undefined>, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key)
        else params.set(key, value)
      }
      if (options?.resetPage !== false) params.delete("page")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return { getParam, setParams, searchParams }
}

export function useUrlFilter(key: string, defaultValue = "") {
  const { getParam, setParams } = useAdminUrlState()
  const value = getParam(key, defaultValue)

  const setValue = useCallback(
    (next: string) => {
      setParams({ [key]: next === defaultValue ? undefined : next || undefined })
    },
    [key, defaultValue, setParams]
  )

  return [value, setValue] as const
}

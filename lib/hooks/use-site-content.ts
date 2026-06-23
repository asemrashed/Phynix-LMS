"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { PublicSiteSettings } from "@fxprime/types"
import { DEFAULT_HOMEPAGE_SECTIONS, mergeSiteSettings } from "@/lib/site-content-defaults"

export function useSiteSettings() {
  const [settings, setSettings] = useState(mergeSiteSettings(null))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api<PublicSiteSettings>("/site/settings")
      .then((data) => {
        if (!cancelled) setSettings(mergeSiteSettings(data))
      })
      .catch(() => {
        if (!cancelled) setSettings(mergeSiteSettings(null))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}

export function useSiteHomepage() {
  return { sections: DEFAULT_HOMEPAGE_SECTIONS, loading: false }
}

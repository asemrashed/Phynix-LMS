"use client"

import { useCallback, useRef, useState } from "react"

const PULL_THRESHOLD = 72
const MAX_PULL = 96

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing || window.scrollY > 0) return
    startY.current = e.touches[0].clientY
    pulling.current = true
  }, [refreshing])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || refreshing) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0 && window.scrollY <= 0) {
        setPullDistance(Math.min(delta * 0.45, MAX_PULL))
      }
    },
    [refreshing]
  )

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(PULL_THRESHOLD)
      try {
        await onRefreshRef.current()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, refreshing])

  return {
    pullDistance,
    refreshing,
    pullHandlers: { onTouchStart, onTouchMove, onTouchEnd },
    isActive: pullDistance > 0 || refreshing,
  }
}

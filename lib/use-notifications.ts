"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { api, getAccessToken } from "@/lib/api"
import { getApiErrorMessage } from "@/lib/api-errors"
import type { NotificationItem, NotificationSocketPayload } from "@fxprime/types"
import { getWsOrigin } from "@/lib/api-url"

const POLL_INTERVAL_MS = 60_000

function getWsUrl() {
  return getWsOrigin()
}

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const applySocketPayload = useCallback((payload: NotificationSocketPayload) => {
    if (payload.deletedId) {
      setNotifications((prev) => prev.filter((n) => n.id !== payload.deletedId))
    }
    if (payload.notification) {
      setNotifications((prev) => {
        const without = prev.filter((n) => n.id !== payload.notification!.id)
        return [payload.notification!, ...without].slice(0, 50)
      })
    }
    setUnreadCount(payload.unreadCount)
    setError(null)
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return
    try {
      const data = await api<{
        notifications: NotificationItem[]
        unreadCount: number
      }>("/notifications")
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load notifications"))
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      setError(null)
      return
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS)

    const token = getAccessToken()
    if (!token) {
      return () => clearInterval(interval)
    }

    const socket = io(getWsUrl(), {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
    })

    socket.on("notification:update", applySocketPayload)
    socketRef.current = socket

    return () => {
      clearInterval(interval)
      socket.off("notification:update", applySocketPayload)
      socket.disconnect()
      socketRef.current = null
    }
  }, [enabled, fetchNotifications, applySocketPayload])

  const handleMarkRead = async (id: string) => {
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // keep optimistic UI minimal — socket will reconcile
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api("/notifications/read-all", { method: "PATCH" })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const handleDismiss = async (id: string) => {
    const removed = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (removed && !removed.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    try {
      await api(`/notifications/${id}`, { method: "DELETE" })
    } catch {
      await fetchNotifications()
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    handleMarkRead,
    handleMarkAllRead,
    handleDismiss,
  }
}

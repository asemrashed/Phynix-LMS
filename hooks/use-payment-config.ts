"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import type { PaymentConfigResponse, PaymentGateway } from "@fxprime/types"

export function usePaymentConfig() {
  const [config, setConfig] = useState<PaymentConfigResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    api<PaymentConfigResponse>("/payments/config")
      .then((data) => {
        if (cancelled) return
        setConfig(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const availableGateways = useMemo(
    () => config?.gateways.filter((gateway) => gateway.available) ?? [],
    [config]
  )

  const [gateway, setGateway] = useState<PaymentGateway>("sslcommerz")

  useEffect(() => {
    if (!config) return
    const available = config.gateways.filter((item) => item.available)
    if (available.length === 0) return
    if (available.some((item) => item.id === config.defaultGateway)) {
      setGateway(config.defaultGateway)
      return
    }
    setGateway(available[0]!.id)
  }, [config])

  return {
    config,
    loading,
    error,
    gateway,
    setGateway,
    availableGateways,
    allowUserChoice: config?.allowUserChoice ?? false,
  }
}

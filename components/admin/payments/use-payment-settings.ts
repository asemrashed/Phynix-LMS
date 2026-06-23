"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { api } from "@/lib/api"
import { uploadPaymentQr } from "@/lib/upload"
import type {
  AdminPaymentGatewaySetting,
  AdminPaymentSettings,
  ManualPaymentMethodConfig,
  PaymentGateway,
  UpdatePaymentSettingsRequest,
} from "@fxprime/types"
import { toast } from "sonner"

export function usePaymentSettings() {
  const [settings, setSettings] = useState<AdminPaymentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabledGateways, setEnabledGateways] = useState<PaymentGateway[]>([])
  const [defaultGateway, setDefaultGateway] = useState<PaymentGateway>("sslcommerz")
  const [allowUserChoice, setAllowUserChoice] = useState(true)
  const [manualMethods, setManualMethods] = useState<ManualPaymentMethodConfig[]>([])
  const [savingManual, setSavingManual] = useState<string | null>(null)
  const [uploadingQr, setUploadingQr] = useState<string | null>(null)
  const qrFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const applySettings = (data: AdminPaymentSettings) => {
    setSettings(data)
    setEnabledGateways(data.gateways.filter((gateway) => gateway.enabled).map((g) => g.id))
    setDefaultGateway(data.defaultGateway)
    setAllowUserChoice(data.allowUserChoice)
    setManualMethods(data.manualMethods)
  }

  useEffect(() => {
    api<AdminPaymentSettings>("/admin/payment-settings")
      .then(applySettings)
      .catch(() => toast.error("Failed to load payment settings"))
      .finally(() => setLoading(false))
  }, [])

  const enabledOptions = useMemo(
    () => settings?.gateways.filter((gateway) => enabledGateways.includes(gateway.id)) ?? [],
    [settings, enabledGateways]
  )

  const persistSettings = async (
    overrides: Partial<UpdatePaymentSettingsRequest> = {},
    options: { toast?: boolean } = { toast: true }
  ) => {
    const nextEnabled = overrides.enabledGateways ?? enabledGateways
    const nextDefault = overrides.defaultGateway ?? defaultGateway
    const nextAllowUserChoice = overrides.allowUserChoice ?? allowUserChoice

    if (nextEnabled.length === 0) {
      toast.error("At least one gateway must stay enabled")
      return false
    }

    setSaving(true)
    try {
      const body: UpdatePaymentSettingsRequest = {
        enabledGateways: nextEnabled,
        defaultGateway: nextDefault,
        allowUserChoice: nextAllowUserChoice,
      }
      const updated = await api<AdminPaymentSettings>("/admin/payment-settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      applySettings(updated)
      if (options.toast) toast.success("Payment settings saved")
      return true
    } catch {
      toast.error("Failed to save payment settings")
      try {
        const data = await api<AdminPaymentSettings>("/admin/payment-settings")
        applySettings(data)
      } catch {
        // keep local state if reload fails
      }
      return false
    } finally {
      setSaving(false)
    }
  }

  const toggleGateway = async (gateway: AdminPaymentGatewaySetting, checked: boolean) => {
    const next = checked
      ? [...enabledGateways, gateway.id]
      : enabledGateways.filter((id) => id !== gateway.id)
    const normalized = next.length > 0 ? next : [gateway.id]
    const nextDefault = normalized.includes(defaultGateway) ? defaultGateway : normalized[0]!

    setEnabledGateways(normalized)
    if (nextDefault !== defaultGateway) {
      setDefaultGateway(nextDefault)
    }

    await persistSettings(
      {
        enabledGateways: normalized,
        defaultGateway: nextDefault,
      },
      { toast: false }
    )
  }

  const handleSave = async () => {
    await persistSettings()
  }

  const updateManualField = (
    id: ManualPaymentMethodConfig["id"],
    field: keyof ManualPaymentMethodConfig,
    value: string | boolean
  ) => {
    setManualMethods((current) =>
      current.map((method) => (method.id === id ? { ...method, [field]: value } : method))
    )
  }

  const handleQrUpload = async (method: ManualPaymentMethodConfig, file: File) => {
    setUploadingQr(method.id)
    try {
      const result = await uploadPaymentQr(file)
      const updated = await api<ManualPaymentMethodConfig>(
        `/admin/payment-settings/manual/${method.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            enabled: method.enabled,
            merchantNumber: method.merchantNumber,
            merchantName: method.merchantName || undefined,
            qrImageUrl: result.url,
            instructions: method.instructions || undefined,
          }),
        }
      )
      setManualMethods((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      toast.success("QR code uploaded and saved")
    } catch {
      toast.error("Failed to upload QR code")
    } finally {
      setUploadingQr(null)
      const input = qrFileInputRefs.current[method.id]
      if (input) input.value = ""
    }
  }

  const saveManualMethod = async (method: ManualPaymentMethodConfig) => {
    setSavingManual(method.id)
    try {
      const updated = await api<ManualPaymentMethodConfig>(
        `/admin/payment-settings/manual/${method.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            enabled: method.enabled,
            merchantNumber: method.merchantNumber,
            merchantName: method.merchantName || undefined,
            qrImageUrl: method.qrImageUrl || undefined,
            instructions: method.instructions || undefined,
          }),
        }
      )
      setManualMethods((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      toast.success(`${method.label} settings saved`)
    } catch {
      toast.error(`Failed to save ${method.label} settings`)
    } finally {
      setSavingManual(null)
    }
  }

  return {
    settings,
    loading,
    saving,
    enabledGateways,
    defaultGateway,
    allowUserChoice,
    manualMethods,
    savingManual,
    uploadingQr,
    qrFileInputRefs,
    enabledOptions,
    setDefaultGateway,
    setAllowUserChoice,
    toggleGateway,
    handleSave,
    updateManualField,
    handleQrUpload,
    saveManualMethod,
  }
}

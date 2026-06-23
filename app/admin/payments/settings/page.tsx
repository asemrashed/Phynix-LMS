"use client"

import { useState } from "react"
import { CheckoutBehaviorTab } from "@/components/admin/payments/checkout-behavior-tab"
import { GatewaysSettingsTab } from "@/components/admin/payments/gateways-settings-tab"
import { ManualMfsSettingsTab } from "@/components/admin/payments/manual-mfs-settings-tab"
import { PaymentSettingsHeader } from "@/components/admin/payments/payment-settings-header"
import { usePaymentSettings } from "@/components/admin/payments/use-payment-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CreditCard, Loader2, Settings2, Smartphone } from "lucide-react"

const TAB_CONFIG = {
  gateways: {
    label: "Gateways",
    description: "Enable payment providers and check server configuration status.",
    icon: CreditCard,
  },
  manual: {
    label: "Manual MFS",
    description: "bKash and Nagad wallet numbers, QR codes, and payment instructions.",
    icon: Smartphone,
  },
  checkout: {
    label: "Checkout",
    description: "Default gateway and whether customers can pick a payment method.",
    icon: Settings2,
  },
} as const

type SettingsTab = keyof typeof TAB_CONFIG

export default function AdminPaymentSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("gateways")
  const paymentSettings = usePaymentSettings()

  if (paymentSettings.loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!paymentSettings.settings) {
    return <p className="py-16 text-center text-muted-foreground">Payment settings unavailable</p>
  }

  const activeConfig = TAB_CONFIG[activeTab]

  return (
    <div className="max-w-full space-y-6">
      <PaymentSettingsHeader />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
      >
        <div className="rounded-[20px] border border-border/70 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-2xl bg-muted/50 p-1.5 sm:grid-cols-3">
              {(Object.keys(TAB_CONFIG) as SettingsTab[]).map((key) => {
                const config = TAB_CONFIG[key]
                const Icon = config.icon

                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all",
                      "hover:bg-background/60 hover:text-foreground",
                      "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{config.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <p className="text-sm text-muted-foreground lg:max-w-sm lg:text-right">
              {activeConfig.description}
            </p>
          </div>
        </div>

        <TabsContent value="gateways" className="mt-6">
          <GatewaysSettingsTab
            gateways={paymentSettings.settings.gateways}
            enabledGateways={paymentSettings.enabledGateways}
            saving={paymentSettings.saving}
            onToggleGateway={paymentSettings.toggleGateway}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <ManualMfsSettingsTab
            manualMethods={paymentSettings.manualMethods}
            savingManual={paymentSettings.savingManual}
            uploadingQr={paymentSettings.uploadingQr}
            qrFileInputRefs={paymentSettings.qrFileInputRefs}
            onUpdateField={paymentSettings.updateManualField}
            onQrUpload={paymentSettings.handleQrUpload}
            onSave={paymentSettings.saveManualMethod}
          />
        </TabsContent>

        <TabsContent value="checkout" className="mt-6">
          <CheckoutBehaviorTab
            defaultGateway={paymentSettings.defaultGateway}
            allowUserChoice={paymentSettings.allowUserChoice}
            enabledOptions={paymentSettings.enabledOptions}
            saving={paymentSettings.saving}
            onDefaultGatewayChange={paymentSettings.setDefaultGateway}
            onAllowUserChoiceChange={paymentSettings.setAllowUserChoice}
            onSave={paymentSettings.handleSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import type { AdminPaymentGatewaySetting, PaymentGateway } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

type GatewaysSettingsTabProps = {
  gateways: AdminPaymentGatewaySetting[]
  enabledGateways: PaymentGateway[]
  saving: boolean
  onToggleGateway: (gateway: AdminPaymentGatewaySetting, checked: boolean) => void
}

export function GatewaysSettingsTab({
  gateways,
  enabledGateways,
  saving,
  onToggleGateway,
}: GatewaysSettingsTabProps) {
  return (
    <Card className="rounded-[20px]">
      <CardHeader>
        <CardTitle>Enabled gateways</CardTitle>
        <CardDescription>
          A gateway must be enabled here and configured in server environment variables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {gateways.map((gateway) => {
          const enabled = enabledGateways.includes(gateway.id)
          return (
            <div
              key={gateway.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{gateway.label}</p>
                  <Badge variant="outline">{gateway.currency}</Badge>
                  {gateway.configured ? (
                    <Badge variant="secondary">Configured</Badge>
                  ) : (
                    <Badge variant="destructive">Not configured</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWD
                </p>
              </div>
              <Switch
                checked={enabled}
                disabled={saving}
                onCheckedChange={(checked) => onToggleGateway(gateway, checked)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

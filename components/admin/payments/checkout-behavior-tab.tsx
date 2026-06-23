import type { AdminPaymentGatewaySetting, PaymentGateway } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

type CheckoutBehaviorTabProps = {
  defaultGateway: PaymentGateway
  allowUserChoice: boolean
  enabledOptions: AdminPaymentGatewaySetting[]
  saving: boolean
  onDefaultGatewayChange: (gateway: PaymentGateway) => void
  onAllowUserChoiceChange: (value: boolean) => void
  onSave: () => void
}

export function CheckoutBehaviorTab({
  defaultGateway,
  allowUserChoice,
  enabledOptions,
  saving,
  onDefaultGatewayChange,
  onAllowUserChoiceChange,
  onSave,
}: CheckoutBehaviorTabProps) {
  return (
    <Card className="rounded-[20px]">
      <CardHeader>
        <CardTitle>Checkout behavior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="default-gateway">Default gateway</Label>
          <Select
            value={defaultGateway}
            onValueChange={(value) => onDefaultGatewayChange(value as PaymentGateway)}
          >
            <SelectTrigger id="default-gateway" className="rounded-xl">
              <SelectValue placeholder="Select default gateway" />
            </SelectTrigger>
            <SelectContent>
              {enabledOptions.map((gateway) => (
                <SelectItem key={gateway.id} value={gateway.id}>
                  {gateway.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
          <div>
            <p className="font-medium text-foreground">Let customers choose</p>
            <p className="text-sm text-muted-foreground">
              Show multiple payment options when more than one gateway is available.
            </p>
          </div>
          <Switch checked={allowUserChoice} onCheckedChange={onAllowUserChoiceChange} />
        </div>

        <Button className="rounded-xl" onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { CreditCard } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { PaymentGateway, PaymentGatewayOption } from "@fxprime/types"

interface PaymentGatewayPickerProps {
  gateways: PaymentGatewayOption[]
  value: PaymentGateway
  onChange: (gateway: PaymentGateway) => void
  allowUserChoice: boolean
  className?: string
}

function GatewayIcon({ gateway }: { gateway: PaymentGateway }) {
  if (gateway === "sslcommerz") return <CreditCard className="h-4 w-4" />
  return null
}

function gatewayDescription(gateway: PaymentGatewayOption): string {
  const manual = gateway.manual ? " · QR / manual verify" : ""
  return `${gateway.label} (${gateway.currency})${manual}`
}

export function PaymentGatewayPicker({
  gateways,
  value,
  onChange,
  allowUserChoice,
  className,
}: PaymentGatewayPickerProps) {
  const available = gateways.filter((gateway) => gateway.available)

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No payment gateway is currently available. Please contact support.
      </p>
    )
  }

  const selected = available.find((gateway) => gateway.id === value) ?? available[0]!
  const showSelect = allowUserChoice && available.length > 1

  if (!showSelect) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor="payment-gateway">Payment method</Label>
        <Select value={selected.id} disabled>
          <SelectTrigger id="payment-gateway" className="rounded-xl">
            <SelectValue>
              <span className="flex items-center gap-2">
                <GatewayIcon gateway={selected.id} />
                {gatewayDescription(selected)}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={selected.id}>{gatewayDescription(selected)}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="payment-gateway">Payment method</Label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as PaymentGateway)}
      >
        <SelectTrigger id="payment-gateway" className="rounded-xl">
          <SelectValue placeholder="Select payment method">
            <span className="flex items-center gap-2">
              <GatewayIcon gateway={selected.id} />
              {gatewayDescription(selected)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {available.map((gateway) => (
            <SelectItem key={gateway.id} value={gateway.id}>
              <span className="flex items-center gap-2">
                <GatewayIcon gateway={gateway.id} />
                {gatewayDescription(gateway)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

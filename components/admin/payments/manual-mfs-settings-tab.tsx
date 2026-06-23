import Image from "next/image"
import type { ManualPaymentMethodConfig } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { RefObject } from "react"

type ManualMfsSettingsTabProps = {
  manualMethods: ManualPaymentMethodConfig[]
  savingManual: string | null
  uploadingQr: string | null
  qrFileInputRefs: RefObject<Record<string, HTMLInputElement | null>>
  onUpdateField: (
    id: ManualPaymentMethodConfig["id"],
    field: keyof ManualPaymentMethodConfig,
    value: string | boolean
  ) => void
  onQrUpload: (method: ManualPaymentMethodConfig, file: File) => void
  onSave: (method: ManualPaymentMethodConfig) => void
}

export function ManualMfsSettingsTab({
  manualMethods,
  savingManual,
  uploadingQr,
  qrFileInputRefs,
  onUpdateField,
  onQrUpload,
  onSave,
}: ManualMfsSettingsTabProps) {
  return (
    <Card className="rounded-[20px]">
      <CardHeader>
        <CardTitle>Manual MFS (bKash / Nagad)</CardTitle>
        <CardDescription>
          Merchant wallet numbers and QR codes shown to students. Admin verifies submitted trx IDs
          in Pending Verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {manualMethods.map((method) => (
          <div key={method.id} className="space-y-4 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{method.label}</p>
                <p className="text-sm text-muted-foreground">Personal / merchant wallet details</p>
              </div>
              <Switch
                checked={method.enabled}
                onCheckedChange={(checked) => onUpdateField(method.id, "enabled", checked)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`${method.id}-number`}>Merchant number</Label>
                <Input
                  id={`${method.id}-number`}
                  className="mt-1 rounded-xl"
                  placeholder="01XXXXXXXXX"
                  value={method.merchantNumber}
                  onChange={(e) => onUpdateField(method.id, "merchantNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`${method.id}-name`}>Account name (optional)</Label>
                <Input
                  id={`${method.id}-name`}
                  className="mt-1 rounded-xl"
                  value={method.merchantName || ""}
                  onChange={(e) => onUpdateField(method.id, "merchantName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor={`${method.id}-qr`}>QR code</Label>
              <Input
                id={`${method.id}-qr`}
                className="rounded-xl"
                placeholder="https://… or upload below"
                value={method.qrImageUrl || ""}
                onChange={(e) => onUpdateField(method.id, "qrImageUrl", e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  ref={(el) => {
                    qrFileInputRefs.current[method.id] = el
                  }}
                  id={`${method.id}-qr-file`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="max-w-sm rounded-xl"
                  disabled={uploadingQr === method.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onQrUpload(method, file)
                  }}
                />
                {uploadingQr === method.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
              {method.qrImageUrl && (
                <div className="rounded-xl border border-border p-4">
                  <p className="mb-3 text-sm text-muted-foreground">Preview</p>
                  <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-xl border border-border bg-white">
                    <Image
                      src={method.qrImageUrl}
                      alt={`${method.label} QR code`}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor={`${method.id}-instructions`}>Instructions (optional)</Label>
              <Textarea
                id={`${method.id}-instructions`}
                className="mt-1 rounded-xl"
                value={method.instructions || ""}
                onChange={(e) => onUpdateField(method.id, "instructions", e.target.value)}
                placeholder="Use Send Money and include the reference code in the note."
              />
            </div>
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={savingManual === method.id}
              onClick={() => onSave(method)}
            >
              {savingManual === method.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Save ${method.label}`
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

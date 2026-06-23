import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PaymentSettingsHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure gateways, manual MFS wallets, and checkout behavior.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/payments/installments">
          <Button variant="outline" className="rounded-xl">
            Installment plans
          </Button>
        </Link>
        <Link href="/admin/payments/pending">
          <Button variant="outline" className="rounded-xl">
            Pending verification
          </Button>
        </Link>
        <Link href="/admin/payments">
          <Button variant="outline" className="rounded-xl">
            View transactions
          </Button>
        </Link>
      </div>
    </div>
  )
}

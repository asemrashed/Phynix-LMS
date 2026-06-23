import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentUnavailableAlertProps {
  configError?: boolean
  className?: string
}

export function PaymentUnavailableAlert({
  configError = false,
  className,
}: PaymentUnavailableAlertProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div>
        <p className="font-medium text-foreground">No payment method available</p>
        <p className="mt-1 text-muted-foreground">
          {configError
            ? "We could not load payment settings. Refresh the page or try again shortly."
            : "No payment gateway is configured right now. Please contact support or try again later."}
        </p>
      </div>
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Circle } from "lucide-react"

const WORKFLOW = ["PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const

const STEP_LABELS: Record<(typeof WORKFLOW)[number], { short: string; long: string }> = {
  PAYMENT_CONFIRMED: { short: "Paid", long: "Payment confirmed" },
  PROCESSING: { short: "Processing", long: "Processing" },
  SHIPPED: { short: "Shipped", long: "Shipped" },
  DELIVERED: { short: "Delivered", long: "Delivered" },
}

function formatStatusLabel(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

function OrderWorkflowVertical({ status }: { status: string }) {
  const currentIdx = WORKFLOW.indexOf(status as (typeof WORKFLOW)[number])

  return (
    <div className="mt-3 space-y-0 sm:hidden">
      {WORKFLOW.map((step, idx) => {
        const done = currentIdx >= 0 && idx < currentIdx
        const active = step === status
        const upcoming = currentIdx >= 0 && idx > currentIdx
        const label = STEP_LABELS[step].short

        return (
          <div key={step} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2",
                  upcoming && "border border-border bg-muted text-muted-foreground",
                  currentIdx < 0 && idx === 0 && "border border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : active ? (
                  <Circle className="h-2 w-2 fill-current" />
                ) : (
                  <Circle className="h-2 w-2" />
                )}
              </div>
              {idx < WORKFLOW.length - 1 && (
                <div className={cn("my-0.5 w-px flex-1 min-h-4", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <p
              className={cn(
                "pb-4 text-sm",
                active && "font-semibold text-foreground",
                done && "text-primary",
                (upcoming || (currentIdx < 0 && idx > 0)) && "text-muted-foreground"
              )}
            >
              {label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function OrderWorkflowHorizontal({ status }: { status: string }) {
  const currentIdx = WORKFLOW.indexOf(status as (typeof WORKFLOW)[number])

  return (
    <div className="mt-4 hidden items-center gap-1 sm:flex">
      {WORKFLOW.map((step, idx) => {
        const done = currentIdx >= 0 && idx < currentIdx
        const active = step === status
        const upcoming = currentIdx >= 0 && idx > currentIdx
        const label = STEP_LABELS[step].long

        return (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
                done && "bg-primary/10 text-primary",
                active && "bg-primary text-primary-foreground",
                upcoming && "bg-muted text-muted-foreground",
                currentIdx < 0 && idx === 0 && "bg-muted text-muted-foreground"
              )}
            >
              {done && <Check className="h-3 w-3" />}
              {label}
            </div>
            {idx < WORKFLOW.length - 1 && (
              <div className={cn("mx-1 h-px w-6 shrink-0", done ? "bg-primary" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function OrderWorkflow({ status }: { status: string }) {
  if (status === "CANCELLED" || status === "RETURNED") {
    return (
      <Badge variant="destructive" className="mt-3">
        {formatStatusLabel(status)}
      </Badge>
    )
  }

  if (status === "PENDING") {
    return (
      <Badge variant="secondary" className="mt-3">
        Awaiting payment
      </Badge>
    )
  }

  if (!WORKFLOW.includes(status as (typeof WORKFLOW)[number])) {
    return <Badge className="mt-3">{formatStatusLabel(status)}</Badge>
  }

  return (
    <>
      <OrderWorkflowVertical status={status} />
      <OrderWorkflowHorizontal status={status} />
    </>
  )
}

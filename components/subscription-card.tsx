"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, AlertTriangle } from "lucide-react"
import type { SubscriptionInfo } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface SubscriptionCardProps {
  subscription: SubscriptionInfo
  onUpdate: (sub: SubscriptionInfo) => void
  className?: string
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ACTIVE") return "default"
  if (status === "GRACE") return "destructive"
  return "secondary"
}

export function SubscriptionCard({
  subscription,
  onUpdate,
  className,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState<"cancel" | "reactivate" | null>(null)

  const handleCancel = async () => {
    setLoading("cancel")
    try {
      const updated = await api<SubscriptionInfo>("/subscription/cancel", {
        method: "POST",
      })
      onUpdate(updated)
      toast.success("Cancellation scheduled for end of billing period")
    } catch {
      toast.error("Failed to cancel subscription")
    } finally {
      setLoading(null)
    }
  }

  const handleReactivate = async () => {
    setLoading("reactivate")
    try {
      const updated = await api<SubscriptionInfo>("/subscription/reactivate", {
        method: "POST",
      })
      onUpdate(updated)
      toast.success("Subscription reactivated")
    } catch {
      toast.error("Failed to reactivate subscription")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={cn("rounded-[20px] bg-card p-6 shadow-sm", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Subscription</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{subscription.plan}</Badge>
            <Badge variant={statusVariant(subscription.status)}>
              {subscription.status}
            </Badge>
            {subscription.hasPremiumAccess && (
              <Badge variant="outline">Premium access</Badge>
            )}
          </div>

          {subscription.expiresAt && (
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
              {new Date(subscription.expiresAt).toLocaleDateString()}
              {subscription.daysUntilExpiry != null &&
                subscription.daysUntilExpiry >= 0 && (
                  <span> ({subscription.daysUntilExpiry} days left)</span>
                )}
            </p>
          )}

          {subscription.status === "GRACE" && subscription.graceEndsAt && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              Grace period ends{" "}
              {new Date(subscription.graceEndsAt).toLocaleDateString()}
            </p>
          )}

          {subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Cancellation scheduled — access continues until period end.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(subscription.canRenew || subscription.plan === "FREE") && (
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/courses">
                {subscription.canRenew ? "Renew Plan" : "Upgrade Plan"}
              </Link>
            </Button>
          )}

          {subscription.canCancel && !subscription.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl text-destructive hover:text-destructive"
                  disabled={loading !== null}
                >
                  Cancel Plan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will keep access until{" "}
                    {subscription.expiresAt
                      ? new Date(subscription.expiresAt).toLocaleDateString()
                      : "the end of your billing period"}
                    . You can reactivate anytime before then.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {loading === "cancel" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Confirm Cancel"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {subscription.cancelAtPeriodEnd && subscription.isActive && (
            <Button
              className="rounded-xl"
              onClick={handleReactivate}
              disabled={loading !== null}
            >
              {loading === "reactivate" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Reactivate"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

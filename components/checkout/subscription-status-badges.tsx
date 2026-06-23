import { Badge } from "@/components/ui/badge"
import type { SubscriptionInfo } from "@fxprime/types"

export function SubscriptionStatusBadges({
  subscription,
}: {
  subscription: SubscriptionInfo | null
}) {
  if (!subscription) return null

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary" className="rounded-lg">
        Current plan: {subscription.plan}
      </Badge>
      {subscription.status === "GRACE" && (
        <Badge variant="destructive" className="rounded-lg">
          Grace period — renew now
        </Badge>
      )}
      {subscription.cancelAtPeriodEnd && (
        <Badge variant="outline" className="rounded-lg">
          Cancels at period end
        </Badge>
      )}
      {subscription.expiresAt && subscription.isActive && subscription.plan !== "LIFETIME" && (
        <Badge variant="outline" className="rounded-lg">
          {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
          {new Date(subscription.expiresAt).toLocaleDateString()}
        </Badge>
      )}
    </div>
  )
}

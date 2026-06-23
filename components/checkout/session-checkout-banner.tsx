import { Calendar, Sparkles } from "lucide-react"
import type { LiveSessionPreview } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function SessionCheckoutBanner({ session }: { session: LiveSessionPreview }) {
  return (
    <Card className="rounded-[20px] border-primary/25 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Session registration included
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{session.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(session.scheduledAt).toLocaleString()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {session.requiresPremium && (
                <Badge variant="secondary" className="rounded-lg">
                  PRO session
                </Badge>
              )}
              <Badge variant="outline" className="rounded-lg">
                {session.durationMinutes} min
              </Badge>
            </div>
            {session.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {session.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

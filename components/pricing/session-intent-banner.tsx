"use client"

import Link from "next/link"
import { Calendar, Loader2, Radio, Sparkles } from "lucide-react"
import type { LiveSessionPreview } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildLiveHubUrl } from "@/lib/live-session-intent"

type SessionIntentBannerProps = {
  session: LiveSessionPreview | null
  loading?: boolean
  proUnlocked: boolean
  registering?: boolean
  onRegister?: () => void
}

export function SessionIntentBanner({
  session,
  loading,
  proUnlocked,
  registering,
  onRegister,
}: SessionIntentBannerProps) {
  if (loading) {
    return (
      <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2 rounded-[20px] border border-border bg-card p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading session details…
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-[20px] border border-primary/25 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Unlock to register
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
            {session.isRegistered && (
              <Badge className="rounded-lg">Already registered</Badge>
            )}
          </div>
        </div>
      </div>

      {session.isRegistered ? (
        <Button className="mt-4 w-full rounded-xl" asChild>
          <Link href={buildLiveHubUrl({ registered: true })}>
            <Radio className="mr-2 h-4 w-4" />
            Go to live class
          </Link>
        </Button>
      ) : proUnlocked && onRegister ? (
        <Button
          className="mt-4 w-full rounded-xl"
          onClick={onRegister}
          disabled={registering}
        >
          {registering ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Radio className="mr-2 h-4 w-4" />
              Register for this session
            </>
          )}
        </Button>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Upgrade to PRO below to register for this session.
        </p>
      )}
    </div>
  )
}

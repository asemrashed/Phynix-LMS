"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LiveHubSession } from "@fxprime/types"
import { Calendar, Circle, Lock, PlayCircle, Radio, Users, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildSubscriptionCheckoutUrl } from "@/lib/checkout-urls"
import { courseEnrollHref, needsCourseEnrollment } from "@/lib/live-session-utils"

interface LiveSessionCardProps {
  session: LiveHubSession
  onRegister?: (sessionId: string) => void
  onJoin?: (session: LiveHubSession) => void
  registering?: boolean
  joining?: boolean
  className?: string
}

function phaseBadge(session: LiveHubSession) {
  if (session.phase === "live") {
    return (
      <Badge className="gap-1 rounded-lg bg-destructive">
        <Circle className="h-2 w-2 fill-current animate-pulse" />
        Live now
      </Badge>
    )
  }
  if (session.recordingUrl) {
    return (
      <Badge variant="secondary" className="gap-1 rounded-lg">
        <PlayCircle className="h-3 w-3" />
        Recording
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="rounded-lg">
      {session.type.replace(/_/g, " ")}
    </Badge>
  )
}

export function LiveSessionCard({
  session,
  onRegister,
  onJoin,
  registering,
  joining,
  className,
}: LiveSessionCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-[20px] border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        session.phase === "live" && "border-destructive/40 ring-1 ring-destructive/20",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {session.phase === "live" ? (
            <Radio className="h-5 w-5 text-destructive" />
          ) : (
            <Video className="h-5 w-5 text-primary" />
          )}
          <h3 className="font-bold text-foreground">{session.title}</h3>
          {phaseBadge(session)}
          {session.requiresPremium ? (
            <Badge variant="secondary" className="rounded-lg">
              PRO
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-lg">
              Free
            </Badge>
          )}
        </div>
        {session.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {session.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(session.scheduledAt).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {session.registrationCount} registered
          </span>
          {session.attended && (
            <Badge variant="outline" className="text-xs">
              Attended
            </Badge>
          )}
          {needsCourseEnrollment(session) && !session.isRegistered && (
            <Badge variant="secondary" className="text-xs">
              Course enrollment required
            </Badge>
          )}
          {session.isPremiumLocked && !session.isRegistered && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Lock className="h-3 w-3" />
              PRO required
            </Badge>
          )}
        </div>
        {session.isRegistered && !session.canJoin && session.joinOpensAt && session.phase !== "ended" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Join opens {new Date(session.joinOpensAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        {session.recordingUrl ? (
          <Button className="rounded-xl" asChild>
            <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
              Watch recording
            </a>
          </Button>
        ) : session.isRegistered ? (
          session.canJoin ? (
            <Button
              className="rounded-xl"
              onClick={() => onJoin?.(session)}
              disabled={joining}
            >
              {joining ? "Opening…" : "Join live"}
            </Button>
          ) : (
            <Badge className="w-fit">Registered</Badge>
          )
        ) : session.phase !== "ended" ? (
          session.isPremiumLocked ? (
            <Button className="rounded-xl" asChild>
              <Link href={buildSubscriptionCheckoutUrl({ plan: "PRO", sessionId: session.id })}>
                Upgrade to PRO
              </Link>
            </Button>
          ) : needsCourseEnrollment(session) && session.courseId ? (
            <Button className="rounded-xl" variant="outline" asChild>
              <Link href={courseEnrollHref(session.courseSlug)}>Enroll in course</Link>
            </Button>
          ) : (
            <Button
              className="rounded-xl"
              onClick={() => onRegister?.(session.id)}
              disabled={registering}
            >
              {registering ? "Registering…" : "Register"}
            </Button>
          )
        ) : null}
      </div>
    </article>
  )
}

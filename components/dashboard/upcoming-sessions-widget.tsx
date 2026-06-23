"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Circle, Radio, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { api, ApiError } from "@/lib/api"
import type { LiveHubResponse, LiveHubSession, SessionJoinResponse } from "@fxprime/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function formatCountdown(scheduledAt: string): string {
  const diff = new Date(scheduledAt).getTime() - Date.now()
  if (diff <= 0) return "Starting soon"
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `in ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `in ${hours}h ${mins % 60}m`
  const days = Math.floor(hours / 24)
  return `in ${days}d`
}

function formatSessionDate(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function SessionRow({
  session,
  onJoin,
  joining,
}: {
  session: LiveHubSession
  onJoin?: (session: LiveHubSession) => void
  joining?: boolean
}) {
  const isLive = session.phase === "live"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between",
        isLive && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {isLive ? (
            <Badge className="gap-1 rounded-lg bg-destructive">
              <Circle className="h-2 w-2 fill-current animate-pulse" />
              Live now
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-lg">
              {formatCountdown(session.scheduledAt)}
            </Badge>
          )}
          {session.isRegistered && (
            <Badge variant="secondary" className="rounded-lg">
              Registered
            </Badge>
          )}
        </div>
        <p className="font-semibold text-foreground">{session.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatSessionDate(session.scheduledAt)}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {isLive && session.canJoin && onJoin ? (
          <Button
            size="sm"
            className="rounded-xl"
            disabled={joining}
            onClick={() => onJoin(session)}
          >
            <Radio className="mr-1.5 h-3.5 w-3.5" />
            Join
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="rounded-xl" asChild>
            <Link href="/live">View</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export function UpcomingSessionsWidget() {
  const router = useRouter()
  const [hub, setHub] = useState<LiveHubResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  async function loadHub() {
    try {
      const data = await api<LiveHubResponse>("/sessions/hub")
      setHub(data)
    } catch {
      setHub(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHub()
    const interval = setInterval(loadHub, 60_000)
    return () => clearInterval(interval)
  }, [])

  async function handleJoin(session: LiveHubSession) {
    setJoining(session.id)
    try {
      const join = await api<SessionJoinResponse>(`/sessions/${session.id}/join`)
      window.open(join.joinUrl, "_blank", "noopener,noreferrer")
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error("Could not join session")
      }
    } finally {
      setJoining(null)
    }
  }

  const registeredUpcoming =
    hub?.upcoming.filter((s) => s.isRegistered).slice(0, 3) ?? []
  const liveNow = hub?.liveNow.filter((s) => s.isRegistered) ?? []
  const sessions = [...liveNow, ...registeredUpcoming]

  return (
    <section className="rounded-[20px] bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Upcoming Live Sessions</h2>
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl" asChild>
          <Link href="/live">All sessions</Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : sessions.length === 0 ? (
        <Empty className="border-none py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Video />
            </EmptyMedia>
            <EmptyTitle>No upcoming sessions</EmptyTitle>
            <EmptyDescription>
              Register for a live class on the support desk to see it here.
            </EmptyDescription>
          </EmptyHeader>
          <Button className="mt-4 rounded-xl" onClick={() => router.push("/live")}>
            Browse live sessions
          </Button>
        </Empty>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onJoin={handleJoin}
              joining={joining === session.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}

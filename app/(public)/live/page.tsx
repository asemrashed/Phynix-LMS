"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LiveSessionCard } from "@/components/live/live-session-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { LiveHubResponse, LiveHubSession, SessionJoinResponse } from "@fxprime/types"
import { Circle, Radio, Video } from "lucide-react"
import { toast } from "sonner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { buildPricingUrl } from "@/lib/live-session-intent"
import { registerLiveSession } from "@/lib/register-live-session"

export default function LiveHubPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-8 text-muted-foreground">
          Loading sessions…
        </main>
      }
    >
      <LiveHubContent />
    </Suspense>
  )
}

function LiveHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registerSessionId = searchParams.get("registerSession")
  const { user } = useAuth()
  const [hub, setHub] = useState<LiveHubResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [joining, setJoining] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [autoRegisterDone, setAutoRegisterDone] = useState(false)

  async function loadHub() {
    try {
      const data = await api<LiveHubResponse>("/sessions/hub")
      setHub(data)
      if (data.liveNow.length > 0) setActiveTab("live")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHub()
    const interval = setInterval(loadHub, 60_000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      toast.success("You're registered for the session!")
    }
  }, [searchParams])

  useEffect(() => {
    if (!registerSessionId || !user || autoRegisterDone || loading) return

    let cancelled = false
    async function autoRegister() {
      const targetSessionId = registerSessionId
      if (!targetSessionId) return
      setRegistering(targetSessionId)
      try {
        const result = await registerLiveSession(targetSessionId)
        if (cancelled) return
        if (result.ok) {
          toast.success("You're registered for the session!")
          await loadHub()
        } else if (result.code === "PREMIUM_REQUIRED" && result.redirectTo) {
          router.replace(result.redirectTo)
        } else if (result.message) {
          toast.error(result.message)
        }
      } finally {
        if (!cancelled) {
          setRegistering(null)
          setAutoRegisterDone(true)
          router.replace("/live", { scroll: false })
        }
      }
    }

    autoRegister()
    return () => {
      cancelled = true
    }
  }, [registerSessionId, user, autoRegisterDone, loading, router])

  async function handleRegister(sessionId: string) {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/live?registerSession=${sessionId}`)}`)
      return
    }
    setRegistering(sessionId)
    try {
      const result = await registerLiveSession(sessionId)
      if (result.ok) {
        await loadHub()
        toast.success("You're registered!")
        return
      }
      if (result.code === "PREMIUM_REQUIRED" && result.redirectTo) {
        router.push(result.redirectTo)
        return
      }
      if (result.code === "NOT_ENROLLED") {
        toast.error("Enroll in the linked course before registering")
      } else if (result.code === "ACCESS_DENIED") {
        toast.error("This session is invite-only")
      } else if (result.code === "CAPACITY_FULL") {
        toast.error("Session is full")
      } else {
        toast.error(result.message)
      }
    } finally {
      setRegistering(null)
    }
  }

  async function handleJoin(session: LiveHubSession) {
    setJoining(session.id)
    try {
      const join = await api<SessionJoinResponse>(`/sessions/${session.id}/join`)
      window.open(join.joinUrl, "_blank", "noopener,noreferrer")
      await loadHub()
    } catch (err) {
      if (err instanceof ApiError && err.code === "PREMIUM_REQUIRED") {
        router.push(buildPricingUrl(session.id))
        return
      }
      toast.error(
        session.joinOpensAt
          ? `Join opens ${new Date(session.joinOpensAt).toLocaleString()}`
          : "Unable to join session"
      )
    } finally {
      setJoining(null)
    }
  }

  function renderList(sessions: LiveHubSession[], emptyTitle: string, emptyDesc: string) {
    if (loading) {
      return <p className="text-muted-foreground">Loading sessions…</p>
    }
    if (sessions.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Video />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDesc}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    return (
      <div className="space-y-4">
        {sessions.map((session) => (
          <LiveSessionCard
            key={session.id}
            session={session}
            onRegister={handleRegister}
            onJoin={handleJoin}
            registering={registering === session.id}
            joining={joining === session.id}
          />
        ))}
      </div>
    )
  }

  const upcoming = hub?.upcoming ?? []
  const liveNow = hub?.liveNow ?? []
  const recordings = hub?.recordings ?? []

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Radio className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Live Support Desk
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Tuition Classes & Webinars
          </h1>
          <p className="mt-2 text-muted-foreground">
            Register for upcoming sessions, join when live, and watch recordings afterward
          </p>
        </div>

        {liveNow.length > 0 && (
          <div className="mb-6 rounded-[20px] border border-destructive/30 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <Circle className="h-2 w-2 fill-current animate-pulse" />
              {liveNow.length} session{liveNow.length === 1 ? "" : "s"} live right now
            </p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 rounded-xl">
            <TabsTrigger value="live" className="rounded-lg">
              Live now ({liveNow.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="recordings" className="rounded-lg">
              Recordings ({recordings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {renderList(
              liveNow,
              "Nothing live right now",
              "Check upcoming sessions or come back when a class is scheduled."
            )}
          </TabsContent>
          <TabsContent value="upcoming">
            {renderList(
              upcoming,
              "No upcoming sessions",
              "New tuition classes and webinars will appear here when scheduled."
            )}
          </TabsContent>
          <TabsContent value="recordings">
            {renderList(
              recordings,
              "No recordings yet",
              "Recordings from sessions you attended will show here after they end."
            )}
          </TabsContent>
        </Tabs>
    </main>
  )
}

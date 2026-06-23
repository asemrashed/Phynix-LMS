"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { downloadCertificatePdf } from "@/lib/certificate-download"
import { getMediaUrl } from "@/lib/media-url"
import type { StudentPortfolio } from "@fxprime/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  BookOpen,
  Clock,
  Copy,
  Check,
  Download,
  ExternalLink,
  GraduationCap,
  Settings,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function PortfolioPage() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api<StudentPortfolio>("/students/me/portfolio")
      .then(setPortfolio)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const copyStudentId = async () => {
    const id = portfolio?.profile.uniqueStudentId
    if (!id) return
    await navigator.clipboard.writeText(id)
    setCopied(true)
    toast.success("Student ID copied")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-[20px] bg-muted" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-[20px] bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!portfolio || !user) return null

  const { profile, stats, enrollments, certificates } = portfolio
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`
  const avatarSrc = getMediaUrl(profile.avatarUrl)
  const completed = enrollments.filter((e) => e.progress === 100)
  const inProgress = enrollments.filter((e) => e.progress < 100)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            My Portfolio
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your learning journey, achievements, and credentials
          </p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline" className="rounded-xl">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <div className="rounded-[20px] bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={profile.firstName} />}
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-lg">
                {profile.country}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-muted px-3 py-1.5 font-mono text-sm">
                {profile.uniqueStudentId || "Available after your first course enrollment"}
              </code>
              {profile.uniqueStudentId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={copyStudentId}
                >
                  {copied ? (
                    <Check className="mr-1 h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="mr-1 h-4 w-4" />
                  )}
                  Copy ID
                </Button>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Member since{" "}
              {new Date(profile.memberSince || Date.now()).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Courses", value: stats.coursesEnrolled, icon: BookOpen },
            { label: "Completed", value: stats.coursesCompleted, icon: GraduationCap },
            { label: "Certificates", value: stats.certificates, icon: Award },
            { label: "Learning Time", value: `${stats.learningHours}h`, icon: Clock },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-muted/50 p-4 text-center">
              <item.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {inProgress.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">In Progress</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {inProgress.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/dashboard/courses/${enrollment.course.slug}`}
                className="rounded-[20px] border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold line-clamp-2">{enrollment.course.title}</h3>
                <Badge variant="outline" className="mt-2 rounded-lg text-xs">
                  {enrollment.course.level}
                </Badge>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Completed Courses</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {completed.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-[20px] border border-primary/20 bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-2">{enrollment.course.title}</h3>
                  <Badge className="shrink-0 rounded-lg">100%</Badge>
                </div>
                {enrollment.completedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Completed{" "}
                    {new Date(enrollment.completedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                <Link href={`/dashboard/courses/${enrollment.course.slug}?review=1`}>
                  <Button variant="ghost" size="sm" className="mt-3 rounded-xl px-0">
                    Rate this course
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Certificates</h2>
          <Link href="/dashboard/certificates">
            <Button variant="ghost" size="sm" className="rounded-xl">
              View vault
            </Button>
          </Link>
        </div>
        {certificates.length === 0 ? (
          <div className="rounded-[20px] bg-card p-8 text-center text-muted-foreground">
            Complete a course to earn your first certificate.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className={cn(
                  "rounded-[20px] border bg-card p-5 shadow-sm",
                  cert.isRevoked ? "border-destructive/30" : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{cert.courseTitle}</h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {cert.certCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/verify/${cert.certCode}`} target="_blank">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="rounded-xl"
                    disabled={!cert.pdfUrl}
                    onClick={() =>
                      downloadCertificatePdf(cert.certCode).catch((e) =>
                        toast.error(e.message)
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

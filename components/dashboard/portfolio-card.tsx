"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AuthUser } from "@fxprime/types"
import { getMediaUrl } from "@/lib/media-url"
import { cn } from "@/lib/utils"
import { BookOpen, Award, Package, Clock, Copy, Check, ArrowRight } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface PortfolioCardProps {
  user: AuthUser
  plan?: string
  stats: {
    coursesEnrolled: number
    certificates: number
    products: number
    learningHours: number
  }
  className?: string
}

export function PortfolioCard({ user, plan = "FREE", stats, className }: PortfolioCardProps) {
  const student = user.student
  const name = student ? `${student.firstName} ${student.lastName}` : user.email
  const initials = student
    ? `${student.firstName[0]}${student.lastName[0]}`
    : "U"
  const avatarSrc = getMediaUrl(student?.avatarUrl)
  const [copied, setCopied] = useState(false)

  const statItems = [
    { label: "Courses Enrolled", value: stats.coursesEnrolled, icon: BookOpen },
    { label: "Certificates", value: stats.certificates, icon: Award },
    { label: "Products", value: stats.products, icon: Package },
    { label: "Learning Time", value: `${stats.learningHours}h`, icon: Clock },
  ]

  const copyStudentId = async () => {
    if (!student?.uniqueStudentId) return
    await navigator.clipboard.writeText(student.uniqueStudentId)
    setCopied(true)
    toast.success("Student ID copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("rounded-[20px] bg-card p-6 shadow-sm", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
          <AvatarFallback className="bg-primary text-xl text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{name}</h2>
            <Badge className="rounded-lg">{plan}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm text-muted-foreground">
              {student?.uniqueStudentId
                ? `Student ID: ${student.uniqueStudentId}`
                : "Student ID: available after your first course enrollment"}
            </p>
            {student?.uniqueStudentId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={copyStudentId}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
        <Link href="/dashboard/portfolio">
          <Button variant="outline" size="sm" className="rounded-xl shrink-0">
            View Portfolio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-muted/50 p-4 text-center"
          >
            <item.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

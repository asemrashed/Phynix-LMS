"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PremiumPaywallProps {
  title?: string
  description?: string
  className?: string
  loginRedirect?: string
  isLoggedIn?: boolean
}

export function PremiumPaywall({
  title = "Premium Content",
  description = "Upgrade to PRO or Lifetime to unlock the full article and all premium resources.",
  className,
  loginRedirect = "/courses",
  isLoggedIn = false,
}: PremiumPaywallProps) {
  return (
    <Card
      className={cn(
        "border-primary/20 bg-primary/5",
        className,
      )}
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="size-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {!isLoggedIn && (
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}>
              Sign in
            </Link>
          </Button>
        )}
        <Button asChild className="rounded-xl">
          <Link href="/courses">View Courses</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

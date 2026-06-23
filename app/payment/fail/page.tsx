"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getDefaultPanelPath } from "@/lib/get-default-panel"

function FailContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const cancelled = searchParams.get("cancelled")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <XCircle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          {cancelled ? "Payment Cancelled" : "Payment Failed"}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {cancelled
            ? "You cancelled the SSLCommerz payment. No charges were made."
            : "Your payment could not be processed. Please try again."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/pricing">
            <Button className="rounded-xl">Try Again</Button>
          </Link>
          <Link href={getDefaultPanelPath(user?.role)}>
            <Button variant="outline" className="rounded-xl">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <FailContent />
    </Suspense>
  )
}

"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="mt-6 flex gap-3">
        <Button className="rounded-xl" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}

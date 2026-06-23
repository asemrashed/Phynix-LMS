"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Application error</h1>
          <p className="mt-2 text-muted-foreground">Please refresh or try again later.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-primary px-4 py-2 text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

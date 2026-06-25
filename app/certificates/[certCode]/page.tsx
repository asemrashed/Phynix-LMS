"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Award, Download, Printer } from "lucide-react"
import type { CertificateVerification } from "@fxprime/types"
import Link from "next/link"
import { resolveApiUrl } from "@/lib/api-url"

export default function CertificatePrintPage() {
  const { certCode } = useParams<{ certCode: string }>()
  const [result, setResult] = useState<CertificateVerification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(resolveApiUrl(`/certificates/${certCode}/verify`))
        const json = await res.json()
        if (json.success) setResult(json.data)
      } catch {
        setResult(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [certCode])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-40 w-full max-w-2xl animate-pulse rounded-[20px] bg-muted" />
      </div>
    )
  }

  if (!result || !result.valid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-muted-foreground">Certificate not found or revoked.</p>
        <Link href="/dashboard/certificates">
          <Button className="rounded-xl">Back to Certificates</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-3xl justify-end gap-2 print:hidden">
        <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button className="rounded-xl" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Save as PDF
        </Button>
      </div>

      <div className="certificate-sheet mx-auto max-w-3xl rounded-[24px] border-4 border-primary/20 bg-card p-10 shadow-xl print:rounded-none print:border-2 print:shadow-none">
        <div className="mb-8 flex items-center justify-center gap-3 text-primary">
          <Award className="h-10 w-10" />
          <span className="text-2xl font-bold tracking-wide">PhynixEducation</span>
        </div>

        <p className="text-center text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Certificate of Completion
        </p>

        <h1 className="mt-6 text-center text-3xl font-bold text-foreground md:text-4xl">
          {result.studentName}
        </h1>

        <p className="mt-4 text-center text-muted-foreground">
          has successfully completed the course
        </p>

        <p className="mt-2 text-center text-xl font-semibold text-primary">
          {result.courseTitle}
        </p>

        <div className="mt-10 grid gap-4 border-t border-border pt-8 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Student ID</p>
            <p className="font-medium">{result.studentId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Issue Date</p>
            <p className="font-medium">{new Date(result.issuedAt).toLocaleDateString()}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Certificate Code</p>
            <p className="font-mono font-medium">{result.certCode}</p>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Verify at englishlms.com/verify/{result.certCode}
        </p>
      </div>
    </div>
  )
}

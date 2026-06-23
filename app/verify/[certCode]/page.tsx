"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Award,
  Copy,
  Check,
  Share2,
  ShieldAlert,
} from "lucide-react"
import type { CertificateVerification } from "@fxprime/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getApiUrl, getSiteUrl } from "@/lib/seo"

const CertificateVerifyQr = dynamic(
  () =>
    import("@/components/certificates/certificate-verify-qr").then(
      (m) => m.CertificateVerifyQr
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[180px] w-[180px] animate-pulse rounded-lg bg-muted"
        aria-hidden
      />
    ),
  }
)

function normalizeCertCode(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return ""
  try {
    return decodeURIComponent(value).trim()
  } catch {
    return value.trim()
  }
}

export default function VerifyCertificatePage() {
  const params = useParams<{ certCode: string }>()
  const certCode = normalizeCertCode(params.certCode)
  const [result, setResult] = useState<CertificateVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const [verifyUrl, setVerifyUrl] = useState("")

  const apiUrl = getApiUrl()

  useEffect(() => {
    if (!certCode) return
    const origin =
      typeof window !== "undefined" ? window.location.origin : getSiteUrl()
    setVerifyUrl(`${origin}/verify/${encodeURIComponent(certCode)}`)
  }, [certCode])

  const qrValue = verifyUrl

  useEffect(() => {
    if (!certCode) {
      setNotFound(true)
      setLoading(false)
      return
    }

    async function verify() {
      try {
        const res = await fetch(
          `${apiUrl}/certificates/${encodeURIComponent(certCode)}/verify`
        )
        const json = await res.json()
        if (json.success) {
          setResult(json.data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [certCode, apiUrl])

  const copyLink = async () => {
    if (!verifyUrl) return
    await navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    toast.success("Verification link copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "IELTS LMS Certificate",
        text: `Verify certificate for ${result?.studentName}`,
        url: verifyUrl,
      })
    } else {
      copyLink()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Award className="h-4 w-4" />
            IELTS LMS — Certificate Verification
          </div>
        </div>

        {loading ? (
          <div className="mx-auto h-96 w-full max-w-lg animate-pulse rounded-[24px] bg-muted" />
        ) : notFound || !result ? (
          <Card className="mx-auto w-full max-w-lg rounded-[24px] border-destructive/20">
            <CardContent className="p-10 text-center">
              <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
              <h1 className="text-2xl font-bold">Certificate Not Found</h1>
              <p className="mt-3 text-muted-foreground">
                The code <code className="rounded bg-muted px-1.5 py-0.5">{certCode}</code> could
                not be verified. It may be invalid or no longer on record.
              </p>
              <Link href="/">
                <Button className="mt-8 rounded-xl">Go Home</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card
            className={cn(
              "mx-auto w-full max-w-lg overflow-hidden rounded-[24px] shadow-lg",
              result.valid ? "border-primary/20" : "border-destructive/30"
            )}
          >
            <div
              className={cn(
                "px-8 py-6 text-center",
                result.valid
                  ? "bg-gradient-to-b from-primary/10 to-transparent"
                  : "bg-gradient-to-b from-destructive/10 to-transparent"
              )}
            >
              {result.valid ? (
                <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-primary" />
              ) : (
                <ShieldAlert className="mx-auto mb-3 h-16 w-16 text-destructive" />
              )}
              <h1
                className={cn(
                  "text-2xl font-bold",
                  result.valid ? "text-primary" : "text-destructive"
                )}
              >
                {result.valid ? "Authentic Certificate" : "Certificate Revoked"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.valid
                  ? "This certificate is officially issued by IELTS LMS"
                  : "This certificate is no longer valid"}
              </p>
              <Badge
                variant={result.valid ? "default" : "destructive"}
                className="mt-4 rounded-full px-4"
              >
                {result.certCode}
              </Badge>
            </div>

            <CardContent className="space-y-6 p-8">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-semibold text-right">{result.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Student ID</span>
                  <span className="font-mono font-medium">{result.studentId}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Course</span>
                  <span className="max-w-[60%] text-right font-semibold">
                    {result.courseTitle}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Issued</span>
                  <span className="font-medium">
                    {new Date(result.issuedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">IELTS LMS</span>
                </div>
              </div>

              {!result.valid && result.revokedReason && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                  <p className="font-medium text-destructive">Revocation reason</p>
                  <p className="mt-1 text-muted-foreground">{result.revokedReason}</p>
                  {result.revokedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Revoked on{" "}
                      {new Date(result.revokedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Scan to verify
                </p>
                {qrValue ? (
                  <CertificateVerifyQr value={qrValue} />
                ) : (
                  <div
                    className="h-[180px] w-[180px] animate-pulse rounded-lg bg-muted"
                    aria-hidden
                  />
                )}
                <p className="max-w-full break-all text-center text-xs text-muted-foreground">
                  {verifyUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={copyLink}
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy Link
                </Button>
                <Button className="flex-1 rounded-xl" onClick={shareLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

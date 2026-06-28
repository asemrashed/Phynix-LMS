"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import type { CertificateVerification } from "@fxprime/types"
import Link from "next/link"
import { resolveApiUrl } from "@/lib/api-url"

const PLATFORM_NAME = "Phynix Education"

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
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E6]">
        <div className="h-40 w-full max-w-4xl animate-pulse rounded-[20px] bg-white/60" />
      </div>
    )
  }

  if (!result || !result.valid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F0E6] px-4">
        <p className="text-neutral-600">Certificate not found or revoked.</p>
        <Link href="/dashboard/certificates">
          <Button className="rounded-xl">Back to Certificates</Button>
        </Link>
      </div>
    )
  }

  const issuedLabel = new Date(result.issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const awardYear = new Date(result.issuedAt).getFullYear()

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #f5f0e6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate-print-toolbar {
            display: none !important;
          }
          .certificate-print-root {
            min-height: 0 !important;
            padding: 0 !important;
            background: #f5f0e6 !important;
          }
          .certificate-sheet {
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="certificate-print-root min-h-screen bg-[#F5F0E6] px-4 py-10 print:min-h-0 print:p-0">
        <div className="certificate-print-toolbar mx-auto mb-6 flex max-w-5xl justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="rounded-xl" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Save as PDF
          </Button>
        </div>

        <div className="certificate-sheet relative mx-auto aspect-[842/595] w-full max-w-5xl bg-[#F5F0E6] p-6 sm:p-8">
          <div className="relative flex h-full flex-col border-[5px] border-[#1B4332] p-4 sm:p-5">
            <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1B4332] bg-white" />
            <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1B4332] bg-white" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#1B4332] bg-white" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 rounded-full border border-[#1B4332] bg-white" />

            <div className="flex h-full flex-col border border-white p-1">
              <div className="flex h-full flex-col border border-[#1B4332] bg-[#FDFCFA] px-6 py-5 sm:px-10 sm:py-7">
                <h2 className="text-center text-lg font-bold text-[#1B2A4A] sm:text-xl">
                  {PLATFORM_NAME}
                </h2>

                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-[#1B2A4A] sm:text-4xl">
                    Certificate of Completion
                  </h1>

                  <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#9CA3AF] sm:text-xs">
                    This is to certify that
                  </p>

                  <div className="mt-4 h-px w-full max-w-md bg-[#D1D5DB]" />

                  <p className="mt-4 text-xl font-bold text-[#1B2A4A] sm:text-3xl">{result.studentName}</p>

                  <p className="mt-5 text-xs text-[#9CA3AF] sm:text-sm">
                    has successfully completed the course
                  </p>

                  <div className="mt-4 h-px w-full max-w-xs bg-[#D1D5DB]" />

                  <p className="mt-4 max-w-2xl text-lg font-semibold text-[#1B4332] sm:text-2xl">
                    {result.courseTitle}
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-end gap-3 pt-4">
                  <div className="text-left">
                    <div className="mb-2 h-px w-full max-w-[8rem] bg-[#D1D5DB]" />
                    <p className="text-[10px] font-medium text-[#1B2A4A] sm:text-xs">
                      Certificate ID: {result.certCode}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-[#1B4332] sm:h-[4.5rem] sm:w-[4.5rem]">
                      <div className="flex h-[calc(100%-10px)] w-[calc(100%-10px)] flex-col items-center justify-center rounded-full border border-dashed border-[#1B4332]">
                        <span className="text-[7px] font-semibold uppercase tracking-wider text-[#1B4332] sm:text-[8px]">
                          Awarded
                        </span>
                        <span className="text-xs font-bold text-[#1B4332] sm:text-sm">{awardYear}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-2 ml-auto h-px w-full max-w-[8rem] bg-[#D1D5DB]" />
                    <p className="text-[10px] font-medium text-[#1B2A4A] sm:text-xs">
                      Issuing Date: {issuedLabel}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-center text-[10px] text-[#9CA3AF] sm:text-xs">
                  Student ID: {result.studentId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

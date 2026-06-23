"use client"

import { useEffect, useState } from "react"
import { CertificateVault } from "@/components/certificates/certificate-vault"
import type { CertificateItem } from "@fxprime/types"
import { api } from "@/lib/api"

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCerts() {
      try {
        const data = await api<CertificateItem[]>("/certificates")
        setCertificates(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [])

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
        Certificate Vault
      </h1>
      <p className="mb-8 text-muted-foreground">
        All your earned certificates in one place — download, share, and verify
      </p>

      <CertificateVault certificates={certificates} loading={loading} />
    </div>
  )
}

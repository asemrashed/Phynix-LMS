"use client"

import { QRCodeSVG } from "qrcode.react"

export function CertificateVerifyQr({ value }: { value: string }) {
  return (
    <QRCodeSVG
      value={value}
      size={180}
      level="M"
      marginSize={2}
      className="rounded-lg bg-white p-2"
      role="img"
      aria-label="Certificate verification QR code"
    />
  )
}

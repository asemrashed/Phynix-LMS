import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { defaultOg, getSiteUrl } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultOg.title,
    template: '%s | IELTS LMS',
  },
  description: defaultOg.description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: defaultOg.siteName,
    title: defaultOg.title,
    description: defaultOg.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultOg.title,
    description: defaultOg.description,
  },
  icons: {
    icon: '/logo/favicon-32x32.png',
    shortcut: '/logo/favicon-32x32.png',
    apple: '/logo/favicon-32x32.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
       {children}
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

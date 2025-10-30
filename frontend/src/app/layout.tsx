import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mise',
  description: 'Comprehensive analytics platform for restaurant operations',
  keywords: ['restaurant', 'analytics', 'dashboard', 'sales', 'performance'],
  authors: [{ name: 'Thais Ferreira Reis' }],
  creator: 'ThaisFReis',
  publisher: 'ThaisFReis',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://mise.vercel.app',
    title: 'Mise',
    description: 'Comprehensive analytics platform for restaurant operations',
    siteName: 'Restaurant Analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mise',
    description: 'Comprehensive analytics platform for restaurant operations',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
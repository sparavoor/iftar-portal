import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Iftar Participation Registration Portal',
  description: 'Register for Iftar 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}

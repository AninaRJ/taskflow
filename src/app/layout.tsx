import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { TimezoneProvider } from '@/providers/TimezoneProvider'

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'A sleek task management app',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <TimezoneProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </TimezoneProvider>
      </body>
    </html>
  )
}

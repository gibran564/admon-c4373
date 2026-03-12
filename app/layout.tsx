import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider }       from '@/context/AuthContext'
import { AuthGuard }          from '@/components/AuthGuard'
import { ConditionalShell }   from '@/components/ConditionalShell'

export const metadata: Metadata = {
  title: 'SCB-1001 — Administración de Base de Datos',
  description: 'Portal del curso SCB-1001 — TecNM ISC — Feb–Jul 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#05080f] text-slate-200 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <AuthGuard>
            <ConditionalShell>
              {children}
            </ConditionalShell>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}

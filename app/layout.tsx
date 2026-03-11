import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'
import { AITutor } from '@/components/AITutor'

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
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-[#21262d] py-4 px-6 text-center playground-hide">
            <p className="font-mono text-xs text-slate-600">
              SCB-1001 · Administración de Base de Datos · TecNM ISC · Feb–Jul 2026
            </p>
          </footer>
          {/* AI Tutor — floats on every page */}
          <AITutor />
        </AuthProvider>
      </body>
    </html>
  )
}

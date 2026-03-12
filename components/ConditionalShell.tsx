'use client'
import { usePathname } from 'next/navigation'
import { Navbar }  from '@/components/Navbar'
import { AITutor } from '@/components/AITutor'
import { useAuth } from '@/context/AuthContext'

const BARE_ROUTES = ['/login']

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const { isTeacher } = useAuth()
  const isBare    = BARE_ROUTES.includes(pathname)

  if (isBare) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t border-[#21262d] py-4 px-6 text-center playground-hide">
        <p className="font-mono text-xs text-slate-600">
          SCB-1001 · Administración de Base de Datos · TecNM ISC · Feb–Jul 2026
        </p>
      </footer>
      {/* AITutor solo para alumnos */}
      {!isTeacher && <AITutor />}
    </>
  )
}

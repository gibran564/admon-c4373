'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PUBLIC_ROUTES = ['/login']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isFirebase, isTeacher } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  useEffect(() => {
    if (!isFirebase || loading) return

    if (!user && !isPublic) {
      router.replace('/login')
      return
    }

    if (user && profile) {
      // Logged-in teacher visiting student pages → redirect to dashboard
      if (isTeacher && !pathname.startsWith('/docente') && pathname !== '/perfil') {
        router.replace('/docente')
        return
      }
      // Logged-in student visiting teacher pages
      if (!isTeacher && pathname.startsWith('/docente')) {
        router.replace('/')
        return
      }
    }
  }, [user, profile, loading, isFirebase, isPublic, isTeacher, pathname, router])

  if (isFirebase && loading) {
    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-slate-600">Verificando sesión…</p>
      </div>
    )
  }

  if (isFirebase && !user && !isPublic) return null

  return <>{children}</>
}

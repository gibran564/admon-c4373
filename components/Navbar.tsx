'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { levelTitle, xpProgressPct } from '@/lib/storage'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const path    = usePathname()
  const router  = useRouter()
  const { profile, signOut, isFirebase, isTeacher } = useAuth()

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/')

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  const studentLinks = [
    { href: '/',           label: 'Roadmap' },
    { href: '/playground', label: '🗄️ SQL',    highlight: true },
    { href: '/misiones',   label: '⚔️ Misiones' },
    { href: '/tablero',    label: 'Entregas' },
    { href: '/perfil',     label: 'Perfil' },
  ]

  const teacherLinks = [
    { href: '/docente',    label: '📊 Panel Docente', highlight: true },
    { href: '/perfil',     label: 'Perfil' },
  ]

  const navLinks = isTeacher ? teacherLinks : studentLinks

  return (
    <nav className="sticky top-0 z-50 border-b border-[#21262d] bg-[#05080f]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href={isTeacher ? '/docente' : '/'} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-sm font-mono">
              DB
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-none text-white">SCB-1001</div>
              <div className="text-xs font-mono leading-none mt-0.5">
                {isTeacher
                  ? <span className="text-violet-400">Panel Docente</span>
                  : <span className="text-slate-500">Admin de BD</span>}
              </div>
            </div>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, highlight }) => (
              <Link key={href} href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive(href)
                    ? 'bg-blue-600/20 text-blue-400'
                    : highlight
                    ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {profile ? (
              <>
                <div className="hidden md:flex items-center gap-2 bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-1.5">
                  <div className={`w-6 h-6 rounded flex items-center justify-center font-black text-white text-xs ${
                    isTeacher
                      ? 'bg-gradient-to-br from-violet-600 to-purple-700'
                      : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                  }`}>
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-mono text-xs text-white leading-none">
                      {profile.name.split(' ')[0]}
                    </div>
                    <div className={`font-mono text-[10px] leading-none mt-0.5 ${isTeacher ? 'text-violet-400' : 'text-blue-400'}`}>
                      {isTeacher ? '🎓 Docente' : `Lv ${profile.level} · ${profile.xp} XP`}
                    </div>
                  </div>
                </div>

                {isFirebase && (
                  <button onClick={handleSignOut} title="Cerrar sesión"
                    className="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-colors">
                    ⎋ Salir
                  </button>
                )}
              </>
            ) : (
              isFirebase && (
                <Link href="/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/20 border border-blue-900/30 transition-colors">
                  Iniciar sesión
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

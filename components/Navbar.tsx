'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getProfile, levelTitle, xpProgressPct } from '@/lib/storage'
import type { StudentProfile } from '@/types'

export function Navbar() {
  const path = usePathname()
  const [profile, setProfile] = useState<StudentProfile | null>(null)

  useEffect(() => {
    const p = getProfile()
    setProfile(p)
    const handler = () => setProfile(getProfile())
    window.addEventListener('storage', handler)
    window.addEventListener('profile-updated', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('profile-updated', handler)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return path === '/'
    return path === href || path.startsWith(href + '/')
  }

  const navLinks = [
    { href: '/',           label: 'Roadmap' },
    { href: '/playground', label: '🗄️ SQL Playground', highlight: true },
    { href: '/misiones',  label: '⚔️ Misiones' },
    { href: '/tablero',    label: 'Entregas' },
    { href: '/perfil',     label: 'Perfil' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[#21262d] bg-[#05080f]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-sm font-mono">
              DB
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-none text-white">SCB-1001</div>
              <div className="text-xs text-slate-500 font-mono leading-none mt-0.5">Admin de BD</div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, highlight }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive(href)
                    ? 'bg-blue-600/20 text-blue-400'
                    : highlight
                    ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* XP Widget */}
          {profile ? (
            <Link href="/perfil" className="flex items-center gap-2 bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-1.5 hover:border-blue-800/60 transition-colors flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-mono text-blue-400 leading-none">{levelTitle(profile.level)}</div>
                <div className="text-xs text-slate-500 leading-none mt-0.5 font-mono">{profile.xp.toLocaleString()} XP</div>
              </div>
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-700/40 flex items-center justify-center text-xs font-black font-mono text-blue-400">
                  {profile.level}
                </div>
                <svg className="absolute inset-0 w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="12" fill="none" stroke="#1e3a5f" strokeWidth="2"/>
                  <circle cx="14" cy="14" r="12" fill="none" stroke="#3b82f6" strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 12}`}
                    strokeDashoffset={`${2 * Math.PI * 12 * (1 - xpProgressPct(profile.xp) / 100)}`}
                    strokeLinecap="round"/>
                </svg>
              </div>
            </Link>
          ) : (
            <Link href="/perfil"
              className="text-xs font-mono text-slate-500 hover:text-blue-400 transition-colors border border-dashed border-[#21262d] rounded-md px-3 py-1.5 hover:border-blue-800/60">
              Crear perfil →
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

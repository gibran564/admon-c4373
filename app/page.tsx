'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { units, practices, getPracticesByUnit } from '@/data/curriculum'
import { getProfile, getSubmissions, levelTitle, xpProgressPct, xpForNextLevel } from '@/lib/storage'
import type { StudentProfile, Submission } from '@/types'

export default function HomePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    localStorage.setItem('tutor_page_context', 'Página principal — Roadmap del curso SCB-1001')
    setProfile(getProfile())
    setSubmissions(getSubmissions())
  }, [])

  const submittedIds = new Set(submissions.map(s => s.practiceId))
  const totalXP = units.reduce((s, u) => s + u.xpReward, 0)
  const semesterStart = new Date('2026-02-03')
  const now = new Date()
  const weekNum = Math.max(1, Math.min(19, Math.floor((now.getTime() - semesterStart.getTime()) / (7*86400*1000)) + 1))

  return (
    <div className="bg-grid">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-[#21262d] px-6 py-16">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-800/30 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono text-xs text-blue-400">TecNM · ISC · Feb–Jul 2026</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black leading-none mb-3">
                <span className="text-white">Administración</span><br />
                <span className="text-blue-400">de Base de Datos</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                6 unidades. 24 prácticas. Un proyecto integrador.<br />
                <span className="text-slate-300">Conviértete en DBA.</span>
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <StatChip label="Semana actual" value={`${weekNum}/19`} color="text-blue-400" />
                <StatChip label="Prácticas" value={`${practices.length}`} color="text-violet-400" />
                <StatChip label="XP disponible" value={totalXP.toLocaleString()} color="text-yellow-400" />
                <StatChip label="Créditos SATCA" value="5" color="text-green-400" />
              </div>
            </div>

            {/* Player card */}
            {profile ? (
              <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-5 min-w-[260px] flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-xl font-black">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white">{profile.name}</div>
                    <div className="font-mono text-xs text-slate-500">{profile.controlNumber}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-blue-400">Nivel {profile.level} — {levelTitle(profile.level)}</span>
                  <span className="text-xs font-mono text-slate-500">{profile.xp} XP</span>
                </div>
                <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                  <div className="xp-bar h-full" style={{ width: `${xpProgressPct(profile.xp)}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs font-mono text-slate-600">0</span>
                  <span className="text-xs font-mono text-slate-600">{xpForNextLevel(profile.level)} XP</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#21262d] flex items-center justify-between">
                  <span className="text-xs text-slate-500">{submittedIds.size} de {practices.length} prácticas</span>
                  <span className="text-xs font-mono text-green-400">{Math.round((submittedIds.size / practices.length) * 100)}% completado</span>
                </div>
              </div>
            ) : (
              <Link href="/perfil" className="bg-[#0d1117] border border-dashed border-blue-800/40 rounded-xl p-6 min-w-[240px] flex-shrink-0 hover:border-blue-600/60 transition-colors group text-center">
                <div className="text-4xl mb-3">🎮</div>
                <div className="font-bold text-white mb-1">¿Eres nuevo aquí?</div>
                <div className="text-sm text-slate-400 mb-4">Crea tu perfil para rastrear tu progreso y ganar XP</div>
                <span className="btn-primary inline-block text-sm">Crear perfil →</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── ROADMAP ─── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs text-blue-400 bg-blue-950/40 border border-blue-800/30 rounded px-2 py-1">ROADMAP</span>
            <h2 className="text-xl font-bold">Las 6 unidades del semestre</h2>
          </div>

          <div className="grid gap-4">
            {units.map((unit, idx) => {
              const unitPractices = getPracticesByUnit(unit.id)
              const doneCount = unitPractices.filter(p => submittedIds.has(p.id)).length
              const pct = Math.round((doneCount / unitPractices.length) * 100)
              const isLocked = unit.status === 'locked'
              const isDone = unit.status === 'done'
              const isActive = unit.status === 'active'

              return (
                <div
                  key={unit.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden
                    ${isDone ? 'border-green-800/50 bg-green-950/10' :
                      isActive ? 'border-blue-800/50 bg-blue-950/10 shadow-lg shadow-blue-950/20' :
                      'border-[#21262d] bg-[#0d1117]/50 opacity-75'}`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon / number */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border
                        ${isDone ? 'bg-green-950/50 border-green-800/40' :
                          isActive ? 'bg-blue-950/50 border-blue-800/40' :
                          'bg-[#161b22] border-[#21262d]'}`}>
                        {isDone ? '✅' : isActive ? unit.icon : '🔒'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div>
                            <div className="font-mono text-xs text-slate-500 mb-0.5">UNIDAD {unit.id.toString().padStart(2,'0')} · {unit.weeks}</div>
                            <h3 className="font-bold text-lg text-white leading-tight">{unit.title}</h3>
                            <p className="text-sm text-slate-400 mt-0.5">{unit.subtitle}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border
                              ${isDone ? 'bg-green-950/60 border-green-800/40 text-green-400' :
                                isActive ? 'bg-blue-950/60 border-blue-800/40 text-blue-400' :
                                'bg-[#161b22] border-[#21262d] text-slate-600'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {isDone ? 'Completada' : isActive ? 'En curso' : 'Próxima'}
                            </div>
                            <div className="font-mono text-xs text-yellow-500 mt-1">+{unit.xpReward} XP</div>
                          </div>
                        </div>

                        {/* Character lore */}
                        {(isDone || isActive) && (
                          <p className="text-sm text-slate-500 mt-2 italic border-l-2 border-[#21262d] pl-3">
                            {unit.characterEmoji} <span className="text-slate-400">{unit.character}:</span> {unit.lore.slice(0, 120)}...
                          </p>
                        )}

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs text-slate-500">{doneCount}/{unitPractices.length} prácticas</span>
                            <span className="font-mono text-xs" style={{ color: unit.accentColor }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: unit.accentColor }} />
                          </div>
                        </div>

                        {/* Practice pills */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {unitPractices.map(p => {
                            const done = submittedIds.has(p.id)
                            return (
                              <Link
                                key={p.id}
                                href={isLocked ? '#' : `/practica/${p.id}`}
                                className={`group flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md border transition-all
                                  ${done ? 'bg-green-950/40 border-green-800/40 text-green-400 hover:bg-green-950/60' :
                                    isLocked ? 'bg-[#161b22] border-[#21262d] text-slate-600 cursor-not-allowed' :
                                    'bg-[#161b22] border-[#21262d] text-slate-400 hover:border-blue-700/60 hover:text-blue-400'}`}
                                onClick={isLocked ? (e) => e.preventDefault() : undefined}
                              >
                                {done ? '✓' : `P${p.id}`}
                                <span>{('mode' in p && p.mode === 'playground') ? '🎮' : '🖥️'}</span>
                                <span className="truncate max-w-[100px]">{p.title.split('—')[0].trim().slice(0, 18)}</span>
                                <span className={`text-xs px-1 rounded font-mono
                                  ${p.type === 'sql' ? 'text-blue-500' :
                                    p.type === 'java' ? 'text-orange-500' :
                                    p.type === 'bash' ? 'text-green-500' : 'text-violet-500'}`}>
                                  {p.type}
                                </span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="border-t border-[#21262d] px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['MySQL 8.x', 'Java 17', 'Spring Boot 3.x', 'JDBC puro', 'Ubuntu 22.04', 'Maven 3.x'].map(t => (
              <span key={t} className="font-mono text-xs text-slate-600 border border-[#21262d] rounded px-2.5 py-1">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2">
      <div className={`font-mono font-bold text-lg leading-none ${color}`}>{value}</div>
      <div className="font-mono text-xs text-slate-600 mt-0.5">{label}</div>
    </div>
  )
}

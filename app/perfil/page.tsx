'use client'
import { useState, useEffect } from 'react'
import { getProfile, saveProfile, getSubmissions, levelTitle, xpProgressPct, xpForNextLevel, xpToLevel } from '@/lib/storage'
import { practices } from '@/data/curriculum'
import type { StudentProfile } from '@/types'
import Link from 'next/link'

const BADGES = [
  { id: 'explorer',  emoji: '🔭', name: 'El Explorador',  desc: 'Completó la Unidad 1', unitId: 1 },
  { id: 'architect', emoji: '🏗️', name: 'El Arquitecto',  desc: 'Completó la Unidad 2', unitId: 2 },
  { id: 'treasurer', emoji: '💾', name: 'El Tesorero',    desc: 'Completó la Unidad 3', unitId: 3 },
  { id: 'mechanic',  emoji: '⚡', name: 'El Mecánico',    desc: 'Completó la Unidad 4', unitId: 4 },
  { id: 'guardian',  emoji: '🔐', name: 'El Guardián',    desc: 'Completó la Unidad 5', unitId: 5 },
  { id: 'oracle',    emoji: '👁️', name: 'El Oráculo',     desc: 'Completó la Unidad 6', unitId: 6 },
  { id: 'grandmaster', emoji: '🏆', name: 'Grand DBA',    desc: 'Completó todas las prácticas', unitId: 0 },
]

export default function PerfilPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [name, setName]       = useState('')
  const [control, setControl] = useState('')
  const [saved, setSaved]     = useState(false)
  const [submissions, setSubmissions] = useState<ReturnType<typeof getSubmissions>>([])

  useEffect(() => {
    const p = getProfile()
    if (p) { setProfile(p); setName(p.name); setControl(p.controlNumber) }
    setSubmissions(getSubmissions())
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !control) return

    const existing = getProfile()
    const newProfile: StudentProfile = {
      name: name.trim(),
      controlNumber: control.trim(),
      setupAt: existing?.setupAt ?? new Date().toISOString(),
      xp: existing?.xp ?? 0,
      level: existing?.level ?? 1,
      badges: existing?.badges ?? [],
    }
    saveProfile(newProfile)
    setProfile(newProfile)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    window.dispatchEvent(new Event('profile-updated'))
  }

  const submittedIds = new Set(submissions.map(s => s.practiceId))
  const submittedByUnit = (unitId: number) =>
    practices.filter(p => p.unitId === unitId && submittedIds.has(p.id)).length
  const totalPracticesByUnit = (unitId: number) =>
    practices.filter(p => p.unitId === unitId).length

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono text-xs text-blue-400 mb-2">CONFIGURACIÓN</div>
        <h1 className="text-3xl font-black text-white">Tu perfil DBA</h1>
        <p className="text-slate-400 mt-1">Tu nombre y número de control se guardarán automáticamente en los formularios de entrega.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-6">

        {/* Form */}
        <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                className="input-dba text-base"
                placeholder="Tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5">
                Número de control <span className="text-red-500">*</span>
              </label>
              <input
                className="input-dba"
                placeholder="ej. 21100123"
                value={control}
                onChange={e => setControl(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full">
                {profile ? '💾 Actualizar perfil' : '🚀 Crear perfil'}
              </button>
            </div>

            {saved && (
              <div className="font-mono text-xs text-green-400 bg-green-950/30 border border-green-800/40 rounded-lg px-3 py-2 text-center">
                ✅ Perfil guardado correctamente
              </div>
            )}
          </form>

          {profile && (
            <div className="mt-5 pt-5 border-t border-[#21262d]">
              <div className="font-mono text-xs text-slate-500 mb-3">ESTADÍSTICAS DEL SEMESTRE</div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Prácticas entregadas" value={`${submittedIds.size}`} sub={`de ${practices.length}`} color="text-blue-400" />
                <StatBox label="XP acumulados" value={profile.xp.toLocaleString()} sub="pts" color="text-yellow-400" />
                <StatBox label="Nivel actual" value={`${profile.level}`} sub={levelTitle(profile.level)} color="text-violet-400" />
                <StatBox label="Completado" value={`${Math.round((submittedIds.size/practices.length)*100)}%`} sub="del curso" color="text-green-400" />
              </div>
            </div>
          )}
        </div>

        {/* Right column: XP + badges */}
        <div className="space-y-4">

          {/* XP Card */}
          {profile && (
            <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-5">
              <div className="text-center mb-4">
                <div className="text-5xl font-black font-mono text-blue-400">{profile.level}</div>
                <div className="text-sm text-white font-bold mt-1">{levelTitle(profile.level)}</div>
                <div className="font-mono text-xs text-slate-500 mt-0.5">{profile.xp.toLocaleString()} XP total</div>
              </div>
              <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-1">
                <div className="xp-bar h-full" style={{ width: `${xpProgressPct(profile.xp)}%` }} />
              </div>
              <div className="flex justify-between font-mono text-xs text-slate-600">
                <span>Lv {profile.level}</span>
                <span>{xpForNextLevel(profile.level)} XP → Lv {profile.level + 1}</span>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">INSIGNIAS</div>
            <div className="space-y-2">
              {BADGES.map(badge => {
                const earned = badge.unitId === 0
                  ? submittedIds.size === practices.length
                  : submittedByUnit(badge.unitId) === totalPracticesByUnit(badge.unitId)
                return (
                  <div key={badge.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors
                      ${earned ? 'bg-yellow-950/20 border border-yellow-800/30' : 'opacity-35'}`}>
                    <span className="text-xl">{earned ? badge.emoji : '🔒'}</span>
                    <div>
                      <div className={`text-xs font-bold ${earned ? 'text-yellow-300' : 'text-slate-600'}`}>
                        {badge.name}
                      </div>
                      <div className="font-mono text-xs text-slate-600">{badge.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Unit progress grid */}
      <div className="mt-8">
        <div className="font-mono text-xs text-slate-500 mb-4">PROGRESO POR UNIDAD</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(uId => {
            const done = submittedByUnit(uId)
            const total = totalPracticesByUnit(uId)
            const pct = total > 0 ? Math.round((done/total)*100) : 0
            const unitColors = ['','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4']
            return (
              <div key={uId} className="rounded-lg border border-[#21262d] bg-[#0d1117] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-slate-500">U{uId}</span>
                  <span className="font-mono text-xs" style={{ color: unitColors[uId] }}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: unitColors[uId] }} />
                </div>
                <div className="font-mono text-xs text-slate-600 mt-1">{done}/{total} prácticas</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-[#161b22] rounded-lg p-3">
      <div className={`font-mono font-bold text-xl ${color}`}>{value}</div>
      <div className="font-mono text-xs text-slate-600 leading-tight">{sub}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

'use client'

export interface MissionProgress {
  missionId: number
  status: 'locked' | 'available' | 'completed'
  completedAt?: string
  xpEarned: number
  hintsUsed: number[]
  bestSQL?: string
}

const KEY = 'scb1001_missions'

export function getMissionProgress(): Record<number, MissionProgress> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function getMissionById_progress(missionId: number): MissionProgress | null {
  return getMissionProgress()[missionId] ?? null
}

export function completeMission(missionId: number, xpEarned: number, sql: string, hintsUsed: number[]) {
  const all = getMissionProgress()
  if (all[missionId]?.status === 'completed') return // Evita farmear XP repitiendo la misma misión.
  all[missionId] = {
    missionId,
    status: 'completed',
    completedAt: new Date().toISOString(),
    xpEarned,
    hintsUsed,
    bestSQL: sql,
  }
  localStorage.setItem(KEY, JSON.stringify(all))
  // XP y progreso viven separados; sincronizamos aquí para que el perfil no se quede en otro arco narrativo.
  const { updateProfileXP } = require('@/lib/storage')
  updateProfileXP(xpEarned)
  window.dispatchEvent(new Event('profile-updated'))
}

export function getMissionsCompleted(): number[] {
  return Object.values(getMissionProgress())
    .filter(m => m.status === 'completed')
    .map(m => m.missionId)
}

export function getMissionsTotalXP(): number {
  return Object.values(getMissionProgress())
    .filter(m => m.status === 'completed')
    .reduce((s, m) => s + m.xpEarned, 0)
}

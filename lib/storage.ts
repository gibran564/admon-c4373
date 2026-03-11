'use client'
import type { StudentProfile, Submission } from '@/types'

const KEYS = {
  PROFILE: 'scb1001_profile',
  SUBMISSIONS: 'scb1001_submissions',
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function getProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEYS.PROFILE)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveProfile(profile: StudentProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
}

export function updateProfileXP(xpToAdd: number): StudentProfile | null {
  const profile = getProfile()
  if (!profile) return null
  profile.xp += xpToAdd
  profile.level = xpToLevel(profile.xp)
  saveProfile(profile)
  return profile
}

export function xpToLevel(xp: number): number {
  if (xp < 200)  return 1
  if (xp < 500)  return 2
  if (xp < 900)  return 3
  if (xp < 1400) return 4
  if (xp < 2000) return 5
  if (xp < 2700) return 6
  if (xp < 3500) return 7
  return 8
}

export function levelTitle(level: number): string {
  const titles = [
    '', 'DBA Rookie', 'Query Apprentice', 'Index Smith',
    'Replica Warden', 'Buffer Guardian', 'Schema Architect',
    'Audit Sentinel', 'Grand DBA Master'
  ]
  return titles[Math.min(level, 8)]
}

export function xpForNextLevel(level: number): number {
  const thresholds = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 9999]
  return thresholds[Math.min(level, 8)]
}

export function xpProgressPct(xp: number): number {
  const level = xpToLevel(xp)
  const prev = xpForNextLevel(level - 1)
  const next = xpForNextLevel(level)
  if (next >= 9999) return 100
  return Math.round(((xp - prev) / (next - prev)) * 100)
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function getSubmissions(): Submission[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEYS.SUBMISSIONS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function getSubmissionByPractice(practiceId: number): Submission | null {
  return getSubmissions().find(s => s.practiceId === practiceId) ?? null
}

export function saveSubmission(sub: Omit<Submission, 'id' | 'submittedAt'>): Submission {
  const submissions = getSubmissions()
  const existingIndex = submissions.findIndex(s => s.practiceId === sub.practiceId)

  const newSub: Submission = {
    ...sub,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    submissions[existingIndex] = newSub
  } else {
    submissions.push(newSub)
  }

  localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions))
  return newSub
}

export function exportSubmissionsCSV(): string {
  const submissions = getSubmissions()
  const header = 'Práctica,Unidad,Nombre,Control,Repositorio,Notas,Enviado'
  const rows = submissions.map(s =>
    [s.practiceTitle, `U${s.unitId}`, s.studentName, s.controlNumber,
     s.repoUrl, s.notes, new Date(s.submittedAt).toLocaleString('es-MX')
    ].map(v => `"${v}"`).join(',')
  )
  return [header, ...rows].join('\n')
}

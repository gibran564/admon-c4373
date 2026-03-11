export type PracticeType = 'sql' | 'java' | 'bash' | 'doc'
export type PracticeMode = 'playground' | 'desktop'
export type UnitStatus  = 'done' | 'active' | 'locked'
export type Difficulty  = 1 | 2 | 3 | 4 | 5

export interface Practice {
  id            : number
  slug          : string
  title         : string
  unitId        : number
  type          : PracticeType
  mode          : PracticeMode
  difficulty    : Difficulty
  xpReward      : number
  estimatedTime : string
  objectives    : string[]
  content       : string
  deliverables  : string[]
  repoRequired  : boolean
  missionIds    : number[]
  desktopTools  ?: string[]
  reportSections?: string[]
}

export interface Unit {
  id: number; slug: string; title: string; subtitle: string; description: string
  status: UnitStatus; accentColor: string; bgGradient: string
  icon: string; character: string; characterEmoji: string; lore: string
  xpReward: number; badgeName: string; badgeEmoji: string
  practiceIds: number[]; weeks: string
}

export interface StudentProfile {
  name: string; controlNumber: string; setupAt: string
  xp: number; level: number; badges: string[]
}

export interface Submission {
  id: string; practiceId: number; practiceTitle: string; unitId: number
  repoUrl: string; reportBranch?: string; notes: string
  studentName: string; controlNumber: string; submittedAt: string; xpEarned: number
}

// ─── AI Tutor ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role    : 'user' | 'assistant'
  content : string
  ts      : number
}

// ─── Video resources ──────────────────────────────────────────────────────────
export interface VideoResource {
  title     : string
  youtubeId : string   // just the ID — you supply this
  duration  : string   // e.g. "12:34"
  subtema   : string   // e.g. "2.1 Estructura de memoria"
  lang      : 'es' | 'en'
}

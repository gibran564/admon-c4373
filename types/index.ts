export type PracticeType     = 'sql' | 'java' | 'bash' | 'doc'
export type PracticeMode     = 'playground' | 'desktop'
export type UnitStatus       = 'done' | 'active' | 'locked'
export type Difficulty       = 1 | 2 | 3 | 4 | 5
export type UserRole         = 'student' | 'teacher'
export type SubmissionStatus = 'pending' | 'approved' | 'revision' | 'rejected'

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
  // ── Identity ──────────────────────────────────────────────
  name          : string
  controlNumber : string  // vacío para docentes
  email         : string
  uid           : string
  role          : UserRole
  setupAt       : string
  // ── Progress (solo alumnos) ───────────────────────────────
  xp            : number
  level         : number
  badges        : string[]
  // ── AI Tutor (opcional) ───────────────────────────────────
  claudeApiKey ?: string
}

export interface Submission {
  id             : string
  uid           ?: string           // Firebase UID del alumno
  practiceId     : number
  practiceTitle  : string
  unitId         : number
  repoUrl        : string
  reportBranch  ?: string
  notes          : string
  studentName    : string
  controlNumber  : string
  submittedAt    : string
  xpEarned       : number
  // ── Revisión docente ─────────────────────────────────────
  status        ?: SubmissionStatus  // default: 'pending'
  grade         ?: number            // 0–100
  teacherComment?: string
  reviewedAt    ?: string
  reviewedBy    ?: string            // nombre del docente
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
  youtubeId : string
  duration  : string
  subtema   : string
  lang      : 'es' | 'en'
}

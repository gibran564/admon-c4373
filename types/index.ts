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
  name          : string
  controlNumber : string  // Docentes no tienen número de control; se queda vacío para no inventar datos.
  email         : string
  uid           : string
  role          : UserRole
  setupAt       : string
  // Progreso solo aplica a alumnos, pero vivir aquí simplifica el perfil local y el de Firestore.
  xp            : number
  level         : number
  badges        : string[]
  // Config opcional del tutor; claudeApiKey queda por compatibilidad con perfiles viejos.
  aiProvider   ?: 'anthropic' | 'openai' | 'groq' | 'compatible'
  aiApiKey     ?: string
  aiModel      ?: string
  aiBaseUrl    ?: string
  claudeApiKey ?: string
}

export interface Submission {
  id             : string
  uid           ?: string           // Solo existe cuando la entrega viene sincronizada desde Firebase.
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
  // Campos que aparecen después de que el docente revisa; localStorage puede no traerlos.
  status        ?: SubmissionStatus
  grade         ?: number
  teacherComment?: string
  reviewedAt    ?: string
  reviewedBy    ?: string
}

export interface ChatMessage {
  role    : 'user' | 'assistant'
  content : string
  ts      : number
}

export interface VideoResource {
  title     : string
  youtubeId : string
  duration  : string
  subtema   : string
  lang      : 'es' | 'en'
}

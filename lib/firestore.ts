import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, addDoc, serverTimestamp,
  orderBy, type Firestore,
} from 'firebase/firestore'
import { db } from './firebase'
import { xpToLevel } from './storage'
import type { StudentProfile, Submission, SubmissionStatus, UserRole } from '@/types'

// ─── Helper ───────────────────────────────────────────────────────────────────

function isTeacherEmail(email: string): boolean {
  // Emails que NO son alumnos → son docentes
  // Alumnos: exactamente 8 dígitos @itdurango.edu.mx
  return !/^\d{8}@itdurango\.edu\.mx$/i.test(email)
}

// ─── USERS ────────────────────────────────────────────────────────────────────

/**
 * Llamada al registrar un alumno nuevo (email/password).
 */
export async function registerStudent(
  uid           : string,
  email         : string,
  name          : string,
  controlNumber : string,
  claudeApiKey ?: string,
): Promise<StudentProfile> {
  if (!db) throw new Error('Firestore no inicializado')
  const ref = doc(db as Firestore, 'users', uid)
  const profile: StudentProfile = {
    name: name.trim(),
    controlNumber: controlNumber.trim(),
    email,
    uid,
    role: 'student',
    setupAt: new Date().toISOString(),
    xp: 0, level: 1, badges: [],
    ...(claudeApiKey ? { claudeApiKey } : {}),
  }
  await setDoc(ref, profile)
  return profile
}

/**
 * Llamada al autenticar con Google o email (login subsecuente).
 * Crea el documento si no existe todavía.
 */
export async function getOrCreateUser(
  uid         : string,
  email       : string,
  displayName?: string | null,
): Promise<StudentProfile | null> {
  if (!db) return null
  const ref  = doc(db as Firestore, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data() as StudentProfile

  const role: UserRole = isTeacherEmail(email) ? 'teacher' : 'student'
  const fallback: StudentProfile = {
    name: displayName ?? '',
    controlNumber: '',
    email,
    uid,
    role,
    setupAt: new Date().toISOString(),
    xp: 0, level: 1, badges: [],
  }
  await setDoc(ref, fallback)
  return fallback
}

export async function updateUserProfile(uid: string, data: Partial<StudentProfile>): Promise<void> {
  if (!db) return
  await updateDoc(doc(db as Firestore, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function addXP(uid: string, amount: number): Promise<void> {
  if (!db) return
  const ref  = doc(db as Firestore, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const current = snap.data().xp ?? 0
  const newXP   = current + amount
  await updateDoc(ref, { xp: newXP, level: xpToLevel(newXP), updatedAt: serverTimestamp() })
}

// ─── STUDENT SUBMISSIONS ──────────────────────────────────────────────────────

export interface FirestoreSubmission {
  practiceId    : number
  practiceTitle : string
  unitId        : number
  repoUrl       : string
  notes         : string
  studentName   : string
  controlNumber : string
  xpEarned      : number
}

/**
 * Alumno entrega / actualiza una práctica. Upsert por (uid, practiceId).
 */
export async function saveFirestoreSubmission(
  uid  : string,
  data : FirestoreSubmission,
): Promise<void> {
  if (!db) return
  const col = collection(db as Firestore, 'submissions')
  const q   = query(col, where('uid', '==', uid), where('practiceId', '==', data.practiceId))
  const existing = await getDocs(q)

  if (!existing.empty) {
    await updateDoc(existing.docs[0].ref, {
      ...data,
      // Keep the current review status if already reviewed
      updatedAt: serverTimestamp(),
    })
  } else {
    await addDoc(col, {
      ...data,
      uid,
      status: 'pending' as SubmissionStatus,
      submittedAt: serverTimestamp(),
    })
    await addXP(uid, data.xpEarned)
  }
}

export async function getUserSubmissions(uid: string): Promise<Submission[]> {
  if (!db) return []
  const q    = query(collection(db as Firestore, 'submissions'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission))
}

// ─── TEACHER FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Obtiene TODAS las entregas de todos los alumnos (solo docentes).
 * Ordenadas por fecha de entrega descendente.
 */
export async function getAllSubmissions(): Promise<Submission[]> {
  if (!db) return []
  const q    = query(
    collection(db as Firestore, 'submissions'),
    orderBy('submittedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    submittedAt: d.data().submittedAt?.toDate?.()?.toISOString?.() ?? d.data().submittedAt ?? '',
    reviewedAt:  d.data().reviewedAt?.toDate?.()?.toISOString?.()  ?? d.data().reviewedAt  ?? '',
  } as Submission))
}

/**
 * Obtiene todos los perfiles de alumnos (role === 'student').
 */
export async function getAllStudents(): Promise<StudentProfile[]> {
  if (!db) return []
  const q    = query(collection(db as Firestore, 'users'), where('role', '==', 'student'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as StudentProfile)
}

/**
 * El docente califica / retroalimenta una entrega.
 */
export async function reviewSubmission(
  submissionId   : string,
  status         : SubmissionStatus,
  grade          : number,
  teacherComment : string,
  teacherName    : string,
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db as Firestore, 'submissions', submissionId), {
    status,
    grade,
    teacherComment,
    reviewedBy: teacherName,
    reviewedAt: serverTimestamp(),
  })
}

// ─── MISSION COMPLETIONS ──────────────────────────────────────────────────────

export async function completeMission(
  uid       : string,
  missionId : string,
  xpEarned  : number,
  hintsUsed : number,
): Promise<boolean> {
  if (!db) return false
  const q = query(
    collection(db as Firestore, 'missionCompletions'),
    where('uid', '==', uid),
    where('missionId', '==', missionId),
  )
  const existing = await getDocs(q)
  if (!existing.empty) return false

  await addDoc(collection(db as Firestore, 'missionCompletions'), {
    uid, missionId, xpEarned, hintsUsed,
    completedAt: serverTimestamp(), attempts: 1,
  })
  await addXP(uid, xpEarned)
  return true
}

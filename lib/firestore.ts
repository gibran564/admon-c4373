import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, addDoc, serverTimestamp,
  type Firestore, increment,
} from 'firebase/firestore'
import { db } from './firebase'
import { xpToLevel } from './storage'
import type { StudentProfile, Submission } from '@/types'

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getOrCreateUser(uid: string, email: string, displayName?: string | null): Promise<StudentProfile | null> {
  if (!db) return null
  const ref = doc(db as Firestore, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) return snap.data() as StudentProfile

  // New user — create with defaults
  const newProfile: StudentProfile & { email: string; uid: string } = {
    name: displayName ?? '',
    controlNumber: '',
    email,
    uid,
    setupAt: new Date().toISOString(),
    xp: 0,
    level: 1,
    badges: [],
  }
  await setDoc(ref, newProfile)
  return newProfile
}

export async function updateUserProfile(uid: string, data: Partial<StudentProfile>): Promise<void> {
  if (!db) return
  const ref = doc(db as Firestore, 'users', uid)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function addXP(uid: string, amount: number): Promise<void> {
  if (!db) return
  const ref = doc(db as Firestore, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const current = snap.data().xp ?? 0
  const newXP  = current + amount
  await updateDoc(ref, { xp: newXP, level: xpToLevel(newXP) })
}

// ─── PRACTICE SUBMISSIONS ─────────────────────────────────────────────────────

export async function saveFirestoreSubmission(
  uid: string,
  sub: Omit<Submission, 'id' | 'submittedAt'>
): Promise<void> {
  if (!db) return

  // Check if already submitted (upsert)
  const q = query(
    collection(db as Firestore, 'submissions'),
    where('uid', '==', uid),
    where('practiceId', '==', sub.practiceId)
  )
  const existing = await getDocs(q)

  if (!existing.empty) {
    const docRef = existing.docs[0].ref
    await updateDoc(docRef, { ...sub, updatedAt: serverTimestamp() })
  } else {
    await addDoc(collection(db as Firestore, 'submissions'), {
      ...sub, uid, submittedAt: serverTimestamp(),
    })
    // Award XP only on first submission
    await addXP(uid, sub.xpEarned)
  }
}

export async function getUserSubmissions(uid: string): Promise<Submission[]> {
  if (!db) return []
  const q = query(collection(db as Firestore, 'submissions'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission))
}

// ─── MISSION COMPLETIONS ──────────────────────────────────────────────────────

export interface MissionCompletion {
  uid: string
  missionId: string
  completedAt: string
  xpEarned: number
  hintsUsed: number
  attempts: number
}

export async function completeMission(
  uid: string,
  missionId: string,
  xpEarned: number,
  hintsUsed: number
): Promise<boolean> {
  if (!db) return false

  // Check if already completed
  const q = query(
    collection(db as Firestore, 'missionCompletions'),
    where('uid', '==', uid),
    where('missionId', '==', missionId)
  )
  const existing = await getDocs(q)
  if (!existing.empty) return false // already done, no duplicate XP

  await addDoc(collection(db as Firestore, 'missionCompletions'), {
    uid, missionId, xpEarned, hintsUsed,
    completedAt: serverTimestamp(), attempts: 1,
  })
  await addXP(uid, xpEarned)
  return true
}

export async function getUserMissionCompletions(uid: string): Promise<MissionCompletion[]> {
  if (!db) return []
  const q = query(collection(db as Firestore, 'missionCompletions'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as MissionCompletion))
}

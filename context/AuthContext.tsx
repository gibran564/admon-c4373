'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { FIREBASE_ENABLED, auth } from '@/lib/firebase'
import { getOrCreateUser, registerStudent, updateUserProfile } from '@/lib/firestore'
import { getProfile, saveProfile, xpToLevel } from '@/lib/storage'
import type { StudentProfile } from '@/types'
import { AI_STORAGE_KEYS, getDefaultModel, normalizeProvider, type AIProvider } from '@/lib/aiProviders'

/** Valida correo institucional de alumno: 8 dígitos @itdurango.edu.mx */
export function isStudentEmail(email: string): boolean {
  return /^\d{8}@itdurango\.edu\.mx$/i.test(email)
}

function syncAISettings(profile: StudentProfile | null) {
  const apiKey = profile?.aiApiKey || profile?.claudeApiKey
  if (!apiKey) return
  const provider = normalizeProvider(profile?.aiProvider || (profile?.claudeApiKey ? 'anthropic' : undefined))
  try {
    localStorage.setItem(AI_STORAGE_KEYS.provider, provider)
    localStorage.setItem(AI_STORAGE_KEYS.apiKey, apiKey)
    localStorage.setItem(AI_STORAGE_KEYS.model, profile?.aiModel || getDefaultModel(provider))
    localStorage.setItem(AI_STORAGE_KEYS.baseUrl, profile?.aiBaseUrl || '')
    if (provider === 'anthropic') localStorage.setItem(AI_STORAGE_KEYS.legacyClaudeApiKey, apiKey)
  } catch {}
}

interface AuthState {
  user          : User | null
  profile       : StudentProfile | null
  loading       : boolean
  isFirebase    : boolean
  isTeacher     : boolean
  signIn        : (email: string, password: string) => Promise<void>
  signInGoogle  : () => Promise<void>
  signUp        : (
    email         : string,
    password      : string,
    name          : string,
    controlNumber : string,
    aiApiKey     ?: string,
    aiProvider   ?: AIProvider,
    aiModel      ?: string,
    aiBaseUrl    ?: string,
  ) => Promise<void>
  signOut       : () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile : (data: Partial<StudentProfile>) => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null, profile: null, loading: true, isFirebase: false, isTeacher: false,
  signIn:         async () => {},
  signInGoogle:   async () => {},
  signUp:         async () => {},
  signOut:        async () => {},
  refreshProfile: async () => {},
  updateProfile:  async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isTeacher = profile?.role === 'teacher'

  // ── Firebase auth listener ────────────────────────────────────────────────
  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) {
      const p = getProfile()
      setProfile(p)
      syncAISettings(p)
      setLoading(false)
      return
    }

    const { onAuthStateChanged } = require('firebase/auth')
    const unsub = onAuthStateChanged(auth, async (fbUser: User | null) => {
      setUser(fbUser)
      if (fbUser) {
        const p = await getOrCreateUser(fbUser.uid, fbUser.email!, fbUser.displayName)
        if (p) { saveProfile(p); setProfile(p); syncAISettings(p) }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // ── Email + Password sign in ──────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    if (!FIREBASE_ENABLED || !auth) return
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    await signInWithEmailAndPassword(auth, email, password)
  }

  // ── Google sign in ────────────────────────────────────────────────────────
  const signInGoogle = async () => {
    if (!FIREBASE_ENABLED || !auth) return
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    await signInWithPopup(auth, new GoogleAuthProvider())
    // onAuthStateChanged handles the rest
  }

  // ── Register new student ──────────────────────────────────────────────────
  const signUp = async (
    email         : string,
    password      : string,
    name          : string,
    controlNumber : string,
    aiApiKey     ?: string,
    aiProvider   ?: AIProvider,
    aiModel      ?: string,
    aiBaseUrl    ?: string,
  ) => {
    if (!FIREBASE_ENABLED || !auth) return
    const { createUserWithEmailAndPassword, updateProfile: updateFBProfile } =
      await import('firebase/auth')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateFBProfile(cred.user, { displayName: name })
    const newProfile = await registerStudent(
      cred.user.uid, email, name, controlNumber, aiApiKey, aiProvider, aiModel, aiBaseUrl,
    )
    saveProfile(newProfile)
    setProfile(newProfile)
    syncAISettings(newProfile)
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    if (!FIREBASE_ENABLED || !auth) return
    const { signOut: fbOut } = await import('firebase/auth')
    await fbOut(auth)
    setProfile(null)
  }

  // ── Refresh from Firestore ────────────────────────────────────────────────
  const refreshProfile = async () => {
    if (!FIREBASE_ENABLED || !user) {
      const p = getProfile(); setProfile(p); syncAISettings(p); return
    }
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    if (!db) return
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) {
      const p = snap.data() as StudentProfile
      saveProfile(p); setProfile(p); syncAISettings(p)
    }
  }

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = async (data: Partial<StudentProfile>) => {
    if (FIREBASE_ENABLED && user) await updateUserProfile(user.uid, data)
    const current = getProfile()
    const updated: StudentProfile = {
      ...(current ?? {
        name: '', controlNumber: '', email: '', uid: '',
        role: 'student', setupAt: new Date().toISOString(),
        xp: 0, level: 1, badges: [],
      }),
      ...data,
    }
    updated.level = xpToLevel(updated.xp)
    saveProfile(updated); setProfile(updated); syncAISettings(updated)
    window.dispatchEvent(new Event('profile-updated'))
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isFirebase: FIREBASE_ENABLED, isTeacher,
      signIn, signInGoogle, signUp, signOut, refreshProfile, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

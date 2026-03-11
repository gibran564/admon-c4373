'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { FIREBASE_ENABLED, auth } from '@/lib/firebase'
import { getOrCreateUser } from '@/lib/firestore'
import { getProfile, saveProfile, xpToLevel } from '@/lib/storage'
import type { StudentProfile } from '@/types'

interface AuthState {
  user:           User | null
  profile:        StudentProfile | null
  loading:        boolean
  isFirebase:     boolean
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
  refreshProfile:   () => Promise<void>
  updateProfile:    (data: Partial<StudentProfile>) => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null, profile: null, loading: true, isFirebase: false,
  signInWithGoogle: async () => {},
  signOut:          async () => {},
  refreshProfile:   async () => {},
  updateProfile:    async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Firebase mode ──
  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) {
      // localStorage mode — load profile immediately
      setProfile(getProfile())
      setLoading(false)
      return
    }

    const { onAuthStateChanged } = require('firebase/auth')
    const unsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getOrCreateUser(firebaseUser.uid, firebaseUser.email!, firebaseUser.displayName)
        if (p) {
          // Sync to localStorage for offline use
          saveProfile(p)
          setProfile(p)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    if (!FIREBASE_ENABLED || !auth) return
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    await signInWithPopup(auth, new GoogleAuthProvider())
  }

  const signOut = async () => {
    if (!FIREBASE_ENABLED || !auth) return
    const { signOut: fbSignOut } = await import('firebase/auth')
    await fbSignOut(auth)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (!FIREBASE_ENABLED || !user) {
      setProfile(getProfile())
      return
    }
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    if (!db) return
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) {
      const p = snap.data() as StudentProfile
      saveProfile(p)
      setProfile(p)
    }
  }

  const updateProfile = async (data: Partial<StudentProfile>) => {
    if (FIREBASE_ENABLED && user) {
      const { updateUserProfile } = await import('@/lib/firestore')
      await updateUserProfile(user.uid, data)
    }
    const current = getProfile()
    const updated = { ...(current ?? { name:'', controlNumber:'', setupAt: new Date().toISOString(), xp:0, level:1, badges:[] }), ...data }
    updated.level = xpToLevel(updated.xp)
    saveProfile(updated)
    setProfile(updated)
    window.dispatchEvent(new Event('profile-updated'))
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isFirebase: FIREBASE_ENABLED,
      signInWithGoogle, signOut, refreshProfile, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

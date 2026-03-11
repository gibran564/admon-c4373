'use client'
import { useState, useEffect } from 'react'
import { getProfile, getSubmissionByPractice, saveSubmission, updateProfileXP } from '@/lib/storage'
import { FIREBASE_ENABLED } from '@/lib/firebase'
import type { Practice } from '@/types'

interface Props {
  practice        : Practice
  unitId         ?: number
  forceRepoRequired?: boolean
  onSubmit       ?: () => void
}

export function PracticeForm({ practice, forceRepoRequired = false, onSubmit }: Props) {
  const [name,     setName]     = useState('')
  const [control,  setControl]  = useState('')
  const [repoUrl,  setRepoUrl]  = useState('')
  const [notes,    setNotes]    = useState('')
  const [status,   setStatus]   = useState<'idle'|'saving'|'success'|'updated'|'error'>('idle')
  const [existing, setExisting] = useState(false)
  const [showXP,   setShowXP]   = useState(false)

  const needsRepo = practice.repoRequired || forceRepoRequired

  useEffect(() => {
    const profile = getProfile()
    if (profile) { setName(profile.name); setControl(profile.controlNumber) }
    const sub = getSubmissionByPractice(practice.id)
    if (sub) { setRepoUrl(sub.repoUrl ?? ''); setNotes(sub.notes ?? ''); setExisting(true) }
  }, [practice.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !control.trim()) return
    if (needsRepo && !repoUrl.trim()) return

    setStatus('saving')

    const submission = {
      id:             `p${practice.id}-${control}`,
      practiceId:     practice.id,
      practiceTitle:  practice.title,
      unitId:         practice.unitId,
      repoUrl:        repoUrl.trim(),
      notes:          notes.trim(),
      studentName:    name.trim(),
      controlNumber:  control.trim(),
      submittedAt:    new Date().toISOString(),
      xpEarned:       practice.xpReward,
    }

    try {
      // 1 — always save to localStorage (offline fallback)
      saveSubmission(submission)
      if (!existing) updateProfileXP(practice.xpReward)

      // 2 — if Firebase is configured, also persist to Firestore
      if (FIREBASE_ENABLED) {
        const { auth } = await import('@/lib/firebase')
        const { saveFirestoreSubmission } = await import('@/lib/firestore')
        if (auth?.currentUser) {
          await saveFirestoreSubmission(auth.currentUser.uid, {
            practiceId:    practice.id,
            practiceTitle: practice.title,
            unitId:        practice.unitId,
            repoUrl:       repoUrl.trim(),
            notes:         notes.trim(),
            studentName:   name.trim(),
            controlNumber: control.trim(),
            xpEarned:      practice.xpReward,
          })
        }
      }

      setStatus(existing ? 'updated' : 'success')
      setExisting(true)
      if (!existing) { setShowXP(true); setTimeout(() => setShowXP(false), 3000) }
      window.dispatchEvent(new Event('profile-updated'))
      if (onSubmit) onSubmit()
    } catch (err) {
      console.error('Submit error:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="relative">
      {/* XP popup */}
      {showXP && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <span className="font-mono font-black text-lg text-yellow-300 drop-shadow-lg">
            +{practice.xpReward} XP ✨
          </span>
        </div>
      )}

      {/* Status banner */}
      {(status === 'success' || status === 'updated') && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-xs font-mono border ${
          status === 'success'
            ? 'bg-green-950/40 border-green-800/40 text-green-300'
            : 'bg-blue-950/40 border-blue-800/40 text-blue-300'
        }`}>
          {status === 'success'
            ? `✅ ¡Práctica entregada! +${practice.xpReward} XP sumados`
            : '🔄 Entrega actualizada correctamente'}
          {FIREBASE_ENABLED && (
            <span className="ml-2 text-slate-500">· guardado en Firebase</span>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="mb-3 rounded-lg px-3 py-2 text-xs font-mono border bg-red-950/40 border-red-800/40 text-red-300">
          ⚠️ Error al guardar. Intenta de nuevo.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input className="input-dba" placeholder="Tu nombre completo"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              No. Control <span className="text-red-500">*</span>
            </label>
            <input className="input-dba" placeholder="ej. 21100123"
              value={control} onChange={e => setControl(e.target.value)} required />
          </div>
        </div>

        {needsRepo && (
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Repositorio GitHub <span className="text-red-500">*</span>
            </label>
            <input className="input-dba" type="url"
              placeholder="https://github.com/usuario/scb1001-practica-X"
              value={repoUrl} onChange={e => setRepoUrl(e.target.value)} required />
            <p className="font-mono text-[11px] text-slate-600 mt-1">
              Incluye el <span className="text-cyan-500">reporte.md</span> completado en la raíz del repo
            </p>
          </div>
        )}

        <div>
          <label className="block font-mono text-xs text-slate-400 mb-1">
            Notas <span className="text-slate-600">(opcional)</span>
          </label>
          <textarea className="input-dba resize-none" rows={2}
            placeholder="Observaciones, dificultades encontradas, preguntas..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={status === 'saving'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {status === 'saving' && (
              <span className="inline-block w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {existing ? '🔄 Actualizar' : `🚀 Entregar (+${practice.xpReward} XP)`}
          </button>
          {!name && !control && (
            <a href="/perfil" className="font-mono text-xs text-blue-400 hover:underline">
              Configura tu perfil →
            </a>
          )}
        </div>

        {/* Firebase status indicator */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${FIREBASE_ENABLED ? 'bg-green-500' : 'bg-slate-600'}`} />
          <span className="font-mono text-[10px] text-slate-600">
            {FIREBASE_ENABLED ? 'Firebase conectado — datos sincronizados' : 'Modo offline — datos en localStorage'}
          </span>
        </div>
      </form>
    </div>
  )
}

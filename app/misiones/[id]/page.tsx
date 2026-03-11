'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useCallback, useEffect, useRef } from 'react'
import { getMissionById, missions, missionUnitColors } from '@/data/missions'
import { SQLEditor } from '@/components/SQLEditor'
import { completeMission, getMissionById_progress } from '@/lib/missionStorage'
import type { QueryResult } from '@/lib/useSQLite'

export default function MisionPage() {
  const params    = useParams()
  const id        = parseInt(params.id as string)
  const mission   = getMissionById(id)

  const [status, setStatus]         = useState<'idle'|'checking'|'pass'|'fail'>('idle')
  const [feedback, setFeedback]     = useState('')
  const [lastResults, setLastResults] = useState<QueryResult[]>([])
  const [lastSQL, setLastSQL]       = useState('')
  const [hintsUsed, setHintsUsed]   = useState<number[]>([])
  const [xpPenalty, setXpPenalty]   = useState(0)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const confettiRef = useRef(false)

  useEffect(() => {
    if (!mission) return
    const progress = getMissionById_progress(mission.id)
    if (progress?.status === 'completed') setAlreadyDone(true)
    localStorage.setItem('tutor_page_context', `Misión ${mission.id}: ${mission.title} (U${mission.unitId} — SQL ${mission.tags?.join(', ') ?? ''})`)
  }, [mission])

  const handleResult = useCallback((results: QueryResult[]) => {
    setLastResults(results)
  }, [])

  const handleRun = useCallback((sql: string) => {
    setLastSQL(sql)
  }, [])

  const handleCheck = useCallback(() => {
    if (!mission || lastResults.length === 0) {
      setFeedback('Ejecuta una consulta primero.')
      setStatus('fail')
      return
    }

    setStatus('checking')
    const { passed, feedback: fb } = mission.validator(lastResults)

    setTimeout(() => {
      setFeedback(fb)
      if (passed) {
        setStatus('pass')
        if (!alreadyDone) {
          const earnedXP = Math.max(10, mission.xpReward - xpPenalty)
          completeMission(mission.id, earnedXP, lastSQL, hintsUsed)
          setAlreadyDone(true)
          if (!confettiRef.current) {
            confettiRef.current = true
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 4000)
          }
        }
      } else {
        setStatus('fail')
      }
    }, 400)
  }, [mission, lastResults, lastSQL, hintsUsed, xpPenalty, alreadyDone])

  const useHint = (hintIdx: number) => {
    if (hintsUsed.includes(hintIdx)) return
    setHintsUsed(prev => [...prev, hintIdx])
    setXpPenalty(prev => prev + (mission!.hints[hintIdx].xpCost))
  }

  if (!mission) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Misión no encontrada</h1>
        <Link href="/misiones" className="btn-primary inline-block mt-4">← Volver a misiones</Link>
      </div>
    )
  }

  const accentColor = missionUnitColors[mission.unitId]
  const currentIdx  = missions.findIndex(m => m.id === id)
  const prevMission = currentIdx > 0 ? missions[currentIdx - 1] : null
  const nextMission = currentIdx < missions.length - 1 ? missions[currentIdx + 1] : null
  const earnedXP    = Math.max(10, mission.xpReward - xpPenalty)

  const diffStars = '⭐'.repeat(mission.difficulty) + '☆'.repeat(5 - mission.difficulty)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="achievement-popup bg-green-950/95 border-2 border-green-600/60 rounded-2xl px-8 py-6 text-center shadow-2xl pointer-events-auto">
            <div className="text-5xl mb-2">🏆</div>
            <div className="font-black text-2xl text-white mb-1">¡Misión completada!</div>
            <div className="font-mono text-green-400 text-lg">+{earnedXP} XP</div>
            {hintsUsed.length > 0 && (
              <div className="font-mono text-xs text-yellow-500 mt-1">
                ({hintsUsed.length} pista{hintsUsed.length > 1 ? 's' : ''} usada{hintsUsed.length > 1 ? 's' : ''} — -{xpPenalty} XP)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/playground" className="hover:text-slate-300 transition-colors">Playground</Link>
        <span>/</span>
        <Link href="/misiones" className="hover:text-slate-300 transition-colors">Misiones</Link>
        <span>/</span>
        <span className="text-slate-400">{mission.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* ─── LEFT: Editor + Feedback ─── */}
        <div className="space-y-4">

          {/* Mission header */}
          <div className="rounded-xl border bg-[#0d1117] p-5 overflow-hidden relative"
            style={{ borderColor: accentColor + '60', borderTopWidth: '3px', borderTopColor: accentColor }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-xs px-2 py-1 rounded border"
                style={{ backgroundColor: accentColor + '15', borderColor: accentColor + '40', color: accentColor }}>
                MISIÓN {mission.id.toString().padStart(2,'0')}
              </span>
              <span className="font-mono text-xs text-slate-500">{diffStars}</span>
              <span className="font-mono text-xs text-slate-500">⏱ {mission.estimatedTime}</span>
              <span className="font-mono text-xs text-yellow-500">+{earnedXP} XP{xpPenalty > 0 ? ` (−${xpPenalty} por pistas)` : ''}</span>
              {alreadyDone && (
                <span className="font-mono text-xs text-green-400 bg-green-950/40 border border-green-800/40 rounded px-2 py-0.5">✓ Completada</span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white mb-1">{mission.title}</h1>
            <p className="text-sm text-slate-400">{mission.subtitle}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mission.tags.map(tag => (
                <span key={tag} className="font-mono text-xs text-slate-600 bg-[#161b22] border border-[#21262d] rounded px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Context / lore */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] px-5 py-4">
            <p className="text-sm text-slate-400 italic leading-relaxed">{mission.context}</p>
          </div>

          {/* Objective */}
          <div className="rounded-xl border bg-blue-950/20 px-5 py-4" style={{ borderColor: accentColor + '40' }}>
            <div className="font-mono text-xs text-blue-400 mb-2">🎯 OBJETIVO</div>
            <p className="text-sm text-white leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: mission.objective.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="font-mono text-blue-300 bg-[#0d1117] px-1 rounded text-xs">$1</code>')
              }}
            />
          </div>

          {/* SQL Editor */}
          <SQLEditor
            initialSQL={mission.starterSQL}
            onResult={handleResult}
            onRun={handleRun}
            height="200px"
            showHistory={false}
          />

          {/* Check button */}
          <button
            onClick={handleCheck}
            disabled={status === 'checking'}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all border
              ${status === 'pass'
                ? 'bg-green-950/40 border-green-700/60 text-green-300 cursor-default'
                : status === 'fail'
                ? 'bg-red-950/20 border-red-800/40 text-red-400 hover:bg-red-950/30'
                : 'bg-blue-600 hover:bg-blue-500 border-transparent text-white hover:shadow-lg hover:shadow-blue-950/50'
              }`}
          >
            {status === 'checking' ? '⏳ Verificando…' :
             status === 'pass' ? '🏆 ¡Misión completada!' :
             status === 'fail' ? '❌ Inténtalo de nuevo — Verificar' :
             '⚡ Verificar solución'}
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`rounded-xl border px-5 py-4 font-mono text-sm leading-relaxed animate-slide-up
              ${status === 'pass'
                ? 'bg-green-950/20 border-green-800/40 text-green-300'
                : 'bg-red-950/20 border-red-800/40 text-red-400'}`}>
              {feedback}
            </div>
          )}

          {/* Prev/Next */}
          <div className="flex justify-between gap-4 pt-2">
            {prevMission ? (
              <Link href={`/misiones/${prevMission.id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="truncate max-w-[160px]">{prevMission.title}</span>
              </Link>
            ) : <div />}
            {nextMission ? (
              <Link href={`/misiones/${nextMission.id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors group text-right">
                <span className="truncate max-w-[160px]">{nextMission.title}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* ─── RIGHT: Hints + Progress ─── */}
        <div className="space-y-4">

          {/* Hints */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">💡 PISTAS</div>
            <div className="space-y-2">
              {mission.hints.map((hint, i) => {
                const used = hintsUsed.includes(i)
                return (
                  <div key={i} className={`rounded-lg border transition-all ${used ? 'border-yellow-800/40 bg-yellow-950/20' : 'border-[#21262d]'}`}>
                    {used ? (
                      <div className="px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-400 text-xs">💡</span>
                          <span className="font-mono text-xs text-yellow-600">Pista {i+1}</span>
                          {hint.xpCost > 0 && <span className="font-mono text-xs text-red-500">−{hint.xpCost} XP</span>}
                        </div>
                        <p className="text-xs text-slate-300">{hint.text}</p>
                      </div>
                    ) : (
                      <button onClick={() => useHint(i)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#161b22] transition-colors rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 text-xs">🔒</span>
                          <span className="font-mono text-xs text-slate-500">Pista {i+1}</span>
                        </div>
                        {hint.xpCost > 0 ? (
                          <span className="font-mono text-xs text-red-600">−{hint.xpCost} XP</span>
                        ) : (
                          <span className="font-mono text-xs text-green-600">gratis</span>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {xpPenalty > 0 && (
              <div className="mt-3 pt-3 border-t border-[#21262d] font-mono text-xs text-red-500 text-center">
                Penalización actual: −{xpPenalty} XP
              </div>
            )}
          </div>

          {/* All missions list */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">TODAS LAS MISIONES</div>
            <div className="space-y-1">
              {missions.map(m => {
                const prog = typeof window !== 'undefined' ? getMissionById_progress(m.id) : null
                const done = prog?.status === 'completed'
                const current = m.id === mission.id
                return (
                  <Link key={m.id} href={`/misiones/${m.id}`}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors font-mono
                      ${current ? 'bg-blue-950/40 border border-blue-800/40 text-blue-300' :
                        done ? 'text-green-500 hover:bg-[#161b22]' : 'text-slate-500 hover:bg-[#161b22] hover:text-slate-300'}`}>
                    <span className="w-4 flex-shrink-0">
                      {done ? '✓' : current ? '▶' : `${m.id}.`}
                    </span>
                    <span className="flex-1 truncate">{m.title}</span>
                    <span style={{ color: missionUnitColors[m.unitId] }} className="text-xs">U{m.unitId}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Link to playground */}
          <Link href="/playground"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#21262d] bg-[#0d1117] hover:border-blue-700/50 p-3 transition-colors">
            <span className="font-mono text-xs text-slate-400">🖥 Abrir consola libre →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

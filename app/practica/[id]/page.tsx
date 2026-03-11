'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPracticeById, getUnitById, typeColors, typeBg, typeLabel, difficultyLabel, getPracticesByUnit } from '@/data/curriculum'
import { getMissionById } from '@/data/missions'
import { PracticeForm } from '@/components/PracticeForm'
import { useEffect, useState } from 'react'
import { getSubmissionByPractice, getProfile } from '@/lib/storage'
import { getMissionById_progress } from '@/lib/missionStorage'
import { generateReportTemplate, downloadMarkdown } from '@/lib/reportTemplate'
import { VideoSection } from '@/components/VideoSection'
import { videosByUnit } from '@/data/videos'

export default function PracticePage() {
  const params   = useParams()
  const id       = parseInt(params.id as string)
  const practice = getPracticeById(id)
  const unit     = practice ? getUnitById(practice.unitId) : undefined

  const [submitted, setSubmitted]   = useState(false)
  const [profile, setProfile]       = useState<{name:string;controlNumber:string}|null>(null)
  const [missionStatuses, setMissionStatuses] = useState<Record<number,boolean>>({})

  useEffect(() => {
    if (!practice) return
    setSubmitted(!!getSubmissionByPractice(practice.id))
    localStorage.setItem('tutor_page_context', `Práctica ${practice.id}: ${practice.title} (U${practice.unitId})`)
    const p = getProfile()
    if (p) setProfile({ name: p.name, controlNumber: p.controlNumber })
    const statuses: Record<number,boolean> = {}
    for (const mid of (practice.missionIds ?? [])) {
      const prog = getMissionById_progress(mid)
      statuses[mid] = prog?.status === 'completed'
    }
    setMissionStatuses(statuses)
  }, [practice])

  if (!practice || !unit) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-4">Práctica no encontrada</h1>
        <Link href="/" className="btn-primary inline-block">← Inicio</Link>
      </div>
    )
  }

  const unitPractices = getPracticesByUnit(practice.unitId)
  const currentIdx    = unitPractices.findIndex(p => p.id === id)
  const prevPractice  = currentIdx > 0 ? unitPractices[currentIdx - 1] : null
  const nextPractice  = currentIdx < unitPractices.length - 1 ? unitPractices[currentIdx + 1] : null
  const accentColor   = typeColors[practice.type]
  const relatedMissions = (practice.missionIds ?? []).map(mid => getMissionById(mid)).filter(Boolean)
  const allMissionsDone = relatedMissions.length > 0 && relatedMissions.every(m => missionStatuses[m!.id])
  const isPlayground  = practice.mode === 'playground'
  const unitVideos    = videosByUnit[practice.unitId] ?? []

  const handleDownloadTemplate = () => {
    const content  = generateReportTemplate(practice, profile?.name, profile?.controlNumber)
    const filename = `P${String(practice.id).padStart(2,'0')}-${practice.slug}-reporte.md`
    downloadMarkdown(content, filename)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-slate-400">U{unit.id}: {unit.title}</span>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{practice.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_310px] gap-6">
        {/* ── Main content ── */}
        <div className="min-w-0">
          {/* Header card */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-6 mb-5"
               style={{ borderTop: `3px solid ${accentColor}` }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`font-mono text-xs px-2.5 py-1 rounded-md border ${typeBg[practice.type]}`}>
                {typeLabel[practice.type]}
              </span>
              {/* Mode badge */}
              <span className={`font-mono text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                isPlayground
                  ? 'bg-blue-950/30 border-blue-800/40 text-blue-300'
                  : 'bg-orange-950/30 border-orange-800/40 text-orange-300'
              }`}>
                {isPlayground ? '🎮 Playground' : '🖥️ Desktop MySQL'}
              </span>
              <span className="font-mono text-xs px-2 py-1 rounded bg-[#161b22] border border-[#21262d] text-slate-400">
                {difficultyLabel[practice.difficulty]}
              </span>
              <span className="font-mono text-xs px-2 py-1 rounded bg-[#161b22] border border-[#21262d] text-slate-400">
                ⏱ {practice.estimatedTime}
              </span>
              <span className="font-mono text-xs px-2 py-1 rounded bg-yellow-950/40 border border-yellow-800/40 text-yellow-400">
                +{practice.xpReward} XP
              </span>
              {submitted && (
                <span className="font-mono text-xs px-2 py-1 rounded bg-green-950/40 border border-green-800/40 text-green-400">
                  ✓ Entregada
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-slate-500 mb-1">PRÁCTICA {practice.id}</div>
            <h1 className="text-2xl font-black text-white leading-tight mb-2">{practice.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{unit.icon}</span><span>{unit.title}</span>
              <span className="text-slate-600">·</span><span>{unit.character}</span>
            </div>
          </div>

          {/* ── PLAYGROUND MODE: Mission launcher ── */}
          {isPlayground && relatedMissions.length > 0 && (
            <div className={`rounded-xl border p-5 mb-5 ${
              allMissionsDone ? 'bg-green-950/15 border-green-800/40' : 'bg-blue-950/15 border-blue-700/40'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{allMissionsDone ? '🏆' : '⚔️'}</span>
                <div>
                  <div className={`font-bold text-sm ${allMissionsDone ? 'text-green-300' : 'text-blue-300'}`}>
                    {allMissionsDone ? '¡Todas las misiones completadas!' : 'Misiones SQL del Playground'}
                  </div>
                  <div className="text-xs text-slate-400">
                    Esta práctica se trabaja en el playground. Completa las misiones para ganar XP.
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {relatedMissions.map(m => {
                  if (!m) return null
                  const done = missionStatuses[m.id]
                  return (
                    <Link key={m.id} href={`/misiones/${m.id}`}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-all group ${
                        done
                          ? 'bg-green-950/20 border-green-800/30 hover:border-green-600/50'
                          : 'bg-[#0d1117] border-[#21262d] hover:border-blue-700/50'
                      }`}>
                      <span className="text-xl flex-shrink-0">{done ? '✅' : '⚔️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-xs leading-tight truncate ${done ? 'text-green-300' : 'text-white'}`}>
                          {m.title}
                        </div>
                        <div className="font-mono text-xs text-slate-500">{m.subtitle}</div>
                      </div>
                      <span className={`font-mono text-xs flex-shrink-0 ${done ? 'text-green-600' : 'text-yellow-600'}`}>
                        {done ? '✓' : `+${m.xpReward}XP`}
                      </span>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-800/20 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">
                  {relatedMissions.filter(m => m && missionStatuses[m.id]).length}/{relatedMissions.length} completadas
                </span>
                <Link href="/playground"
                  className="font-mono text-xs px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-700/40 text-blue-400 hover:border-blue-500/60 transition-colors">
                  Abrir playground →
                </Link>
              </div>
            </div>
          )}

          {/* ── DESKTOP MODE: Tools required banner ── */}
          {!isPlayground && (
            <div className="rounded-xl border border-orange-800/30 bg-orange-950/10 p-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🖥️</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-orange-300 mb-1">Práctica de escritorio — MySQL real</div>
                  <p className="text-xs text-slate-400 mb-2">
                    Esta práctica requiere una instalación real de MySQL. Cuando termines, sube tu repositorio a GitHub con el reporte MD.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(practice.desktopTools ?? ['MySQL 8.x','Ubuntu Server']).map(tool => (
                      <span key={tool}
                        className="font-mono text-xs px-2 py-0.5 rounded bg-[#161b22] border border-orange-800/20 text-orange-400/70">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Objectives ── */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-5 mb-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">🎯</span> Objetivos
            </h2>
            <ol className="space-y-2">
              {practice.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="font-mono text-xs text-blue-500 mt-0.5 flex-shrink-0">{String(i+1).padStart(2,'0')}.</span>
                  {obj}
                </li>
              ))}
            </ol>
          </div>

          {/* ── Content ── */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-6 mb-5">
            <div className="prose-dba">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{practice.content}</ReactMarkdown>
            </div>
          </div>

          {/* ── Deliverables ── */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-5 mb-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-green-400">📦</span> Entregables
            </h2>
            <ul className="space-y-2">
              {practice.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">□</span>{d}
                </li>
              ))}
            </ul>
          </div>

          {/* Prev / Next */}
          <div className="flex gap-3">
            {prevPractice && (
              <Link href={`/practica/${prevPractice.id}`}
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-[#21262d] bg-[#0d1117] hover:border-slate-600 transition-colors">
                <span className="text-slate-500">←</span>
                <div>
                  <div className="font-mono text-xs text-slate-500">Anterior</div>
                  <div className="text-sm font-semibold text-slate-300 truncate">{prevPractice.title}</div>
                </div>
              </Link>
            )}
            {nextPractice && (
              <Link href={`/practica/${nextPractice.id}`}
                className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-[#21262d] bg-[#0d1117] hover:border-slate-600 transition-colors text-right">
                <div>
                  <div className="font-mono text-xs text-slate-500">Siguiente</div>
                  <div className="text-sm font-semibold text-slate-300 truncate">{nextPractice.title}</div>
                </div>
                <span className="text-slate-500">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Report Template (desktop only) */}
          {!isPlayground && (
            <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
              <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <span className="text-cyan-400">📄</span> Plantilla de reporte
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Descarga el template MD pre-rellenado con los objetivos y secciones de esta práctica.
              </p>
              <button onClick={handleDownloadTemplate}
                className="w-full font-mono text-xs py-2.5 px-3 rounded-lg border border-cyan-800/40 bg-cyan-950/20 text-cyan-300 hover:border-cyan-600/50 transition-colors flex items-center justify-center gap-2">
                ⬇️ Descargar reporte.md
              </button>
              <p className="font-mono text-xs text-slate-600 mt-2 text-center">
                Súbelo a tu repo como <code className="text-slate-500">reporte.md</code>
              </p>
            </div>
          )}

          {/* Submit form */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <span className="text-green-400">🚀</span>
              {isPlayground ? 'Registrar entrega' : 'Subir al repositorio'}
            </h3>
            {!isPlayground && (
              <p className="text-xs text-slate-400 mb-3">
                Sube tu práctica a GitHub con el <code className="text-cyan-400 text-xs">reporte.md</code> y comparte el link aquí.
              </p>
            )}
            <PracticeForm
              practice={practice}
              onSubmit={() => setSubmitted(true)}
              forceRepoRequired={!isPlayground}
            />
          </div>

          {/* Video resources */}
          {unitVideos.length > 0 && (
            <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <span className="text-red-400">🎬</span> Videos de apoyo
              </h3>
              <VideoSection videos={unitVideos} unitId={practice.unitId} />
            </div>
          )}

          {/* Unit practices sidebar */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">PRÁCTICAS DE {unit.title.toUpperCase()}</div>
            <div className="space-y-1">
              {unitPractices.map(p => (
                <Link key={p.id} href={`/practica/${p.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    p.id === id
                      ? 'bg-[#21262d] text-white'
                      : 'text-slate-400 hover:bg-[#161b22] hover:text-white'
                  }`}>
                  <span className="font-mono text-xs text-slate-600 w-5 flex-shrink-0">{p.id}</span>
                  <span className={`text-xs px-1 rounded flex-shrink-0 ${p.mode === 'playground' ? 'text-blue-500' : 'text-orange-500'}`}>
                    {p.mode === 'playground' ? '🎮' : '🖥️'}
                  </span>
                  <span className="truncate">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Character lore */}
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="text-2xl text-center mb-2">{unit.characterEmoji}</div>
            <div className="font-mono text-xs text-slate-500 text-center mb-2">{unit.character}</div>
            <p className="text-xs text-slate-400 text-center italic leading-relaxed line-clamp-4">{unit.lore}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

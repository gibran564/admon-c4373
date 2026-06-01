'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getAllSubmissions, getAllStudents, reviewSubmission } from '@/lib/firestore'
import { practices, units } from '@/data/curriculum'
import type { Submission, StudentProfile, SubmissionStatus } from '@/types'

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-800/40' },
  approved: { label: 'Aprobada',  color: 'text-green-400',  bg: 'bg-green-950/30',  border: 'border-green-800/40' },
  revision: { label: 'Revisión',  color: 'text-blue-400',   bg: 'bg-blue-950/30',   border: 'border-blue-800/40' },
  rejected: { label: 'Rechazada', color: 'text-red-400',    bg: 'bg-red-950/30',    border: 'border-red-800/40' },
}

type ActiveView = 'overview' | 'submissions' | 'students'

export default function DocentePage() {
  const { profile, isTeacher, loading } = useAuth()
  const router = useRouter()

  const [view,        setView]        = useState<ActiveView>('overview')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students,    setStudents]    = useState<StudentProfile[]>([])
  const [fetching,    setFetching]    = useState(true)
  const [selected,    setSelected]    = useState<Submission | null>(null)
  const [filterUnit,  setFilterUnit]  = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'all'>('all')
  const [search,      setSearch]      = useState('')

  // El guard ya redirige, pero esta página se protege sola por si se renderiza directo durante hidratación.
  useEffect(() => {
    if (!loading && !isTeacher) router.replace('/')
  }, [loading, isTeacher, router])

  const loadData = useCallback(async () => {
    setFetching(true)
    const [subs, studs] = await Promise.all([getAllSubmissions(), getAllStudents()])
    setSubmissions(subs)
    setStudents(studs)
    setFetching(false)
  }, [])

  useEffect(() => { if (isTeacher) loadData() }, [isTeacher, loadData])

  if (loading || (!isTeacher && !loading)) return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalPractices = practices.length
  const pending   = submissions.filter(s => !s.status || s.status === 'pending').length
  const approved  = submissions.filter(s => s.status === 'approved').length
  const revision  = submissions.filter(s => s.status === 'revision').length
  const rejected  = submissions.filter(s => s.status === 'rejected').length

  // Los filtros se aplican en memoria porque el volumen del curso es chico y así evitamos índices extra en Firestore.
  const filteredSubs = submissions.filter(s => {
    if (filterUnit   && s.unitId !== filterUnit)                               return false
    if (filterStatus !== 'all' && (s.status ?? 'pending') !== filterStatus)    return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.studentName?.toLowerCase().includes(q) &&
          !s.controlNumber?.toLowerCase().includes(q) &&
          !s.practiceTitle?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const studentSubs = (uid: string) => submissions.filter(s => s.uid === uid)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-violet-400 mb-1">PANEL DOCENTE</div>
          <h1 className="text-3xl font-black text-white">Dashboard SCB-1001</h1>
          <p className="text-slate-400 text-sm mt-1">
            {profile?.name} · {students.length} alumnos · {submissions.length} entregas
          </p>
        </div>
        <button onClick={loadData} disabled={fetching}
          className="px-3 py-1.5 rounded-lg border border-[#21262d] text-xs font-mono text-slate-400 hover:text-white hover:border-blue-700/50 transition-colors disabled:opacity-40">
          {fetching ? '⟳ Cargando…' : '⟳ Actualizar'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard label="Alumnos"   value={students.length}   color="text-white"        />
        <StatCard label="Entregas"  value={submissions.length} color="text-blue-400"    />
        <StatCard label="Pendientes" value={pending}  color="text-yellow-400"           />
        <StatCard label="Aprobadas" value={approved}  color="text-green-400"            />
        <StatCard label="En revisión" value={revision + rejected} color="text-red-400" />
      </div>

      <div className="flex gap-1 mb-6 bg-[#0d1117] border border-[#21262d] rounded-xl p-1 w-fit">
        {([
          ['overview',     '📊 Resumen'],
          ['submissions',  '📋 Entregas'],
          ['students',     '👥 Alumnos'],
        ] as [ActiveView, string][]).map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === v ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
          <Section title="Avance por unidad">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map(unit => {
                const unitPractices = practices.filter(p => p.unitId === unit.id)
                const unitSubs      = submissions.filter(s => s.unitId === unit.id)
                const uniqueStudentSubs = new Set(unitSubs.map(s => s.uid)).size
                const pct = unitPractices.length
                  ? Math.round((unitSubs.length / (unitPractices.length * Math.max(students.length, 1))) * 100)
                  : 0
                return (
                  <div key={unit.id} className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{unit.icon ?? '📦'}</span>
                      <div>
                        <div className="font-bold text-xs text-white">U{unit.id} · {unit.title}</div>
                        <div className="font-mono text-[10px] text-slate-500">{unit.weeks}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>{unitSubs.length} entregas</span>
                      <span>{pct}% cobertura</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="Top 10 alumnos por XP">
            <div className="rounded-xl border border-[#21262d] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1117] border-b border-[#21262d]">
                    {['#','Alumno','Control','XP','Nivel','Entregas','%'].map(h => (
                      <th key={h} className="text-left font-mono text-xs text-slate-500 px-3 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...students]
                    .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
                    .slice(0, 10)
                    .map((st, i) => {
                      const stSubs = studentSubs(st.uid)
                      const pct = Math.round((stSubs.length / totalPractices) * 100)
                      return (
                        <tr key={st.uid} className="border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
                          <td className="px-3 py-2 font-mono text-xs text-slate-500">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                          </td>
                          <td className="px-3 py-2 font-semibold text-white text-xs">{st.name}</td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-400">{st.controlNumber}</td>
                          <td className="px-3 py-2 font-mono text-xs text-yellow-400">{st.xp ?? 0}</td>
                          <td className="px-3 py-2 font-mono text-xs text-violet-400">Lv {st.level ?? 1}</td>
                          <td className="px-3 py-2 font-mono text-xs text-blue-400">{stSubs.length}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-mono text-[10px] text-slate-500">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {view === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text" placeholder="🔍 Buscar alumno, control, práctica…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-dba flex-1 min-w-[200px] max-w-xs text-sm"
            />
            <select value={filterUnit ?? ''} onChange={e => setFilterUnit(e.target.value ? Number(e.target.value) : null)}
              className="input-dba w-auto text-sm">
              <option value="">Todas las unidades</option>
              {units.map(u => <option key={u.id} value={u.id}>U{u.id} — {u.title}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="input-dba w-auto text-sm">
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="font-mono text-xs text-slate-500 mb-2">{filteredSubs.length} entregas</div>

          {fetching ? (
            <div className="text-center py-20 text-slate-500 font-mono text-sm">Cargando entregas…</div>
          ) : filteredSubs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#21262d] rounded-xl text-slate-500">
              Sin entregas que coincidan
            </div>
          ) : (
            <div className="rounded-xl border border-[#21262d] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0d1117] border-b border-[#21262d]">
                      {['Alumno','Control','Práctica','Unidad','Repositorio','Estado','Calif.','Fecha','Acción'].map(h => (
                        <th key={h} className="text-left font-mono text-xs text-slate-500 px-3 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map((sub, i) => {
                      const status = (sub.status ?? 'pending') as SubmissionStatus
                      const sc     = STATUS_CONFIG[status]
                      return (
                        <tr key={sub.id}
                          className={`border-b border-[#21262d] hover:bg-[#161b22] transition-colors ${i % 2 === 1 ? 'bg-[#0a0e16]/40' : ''}`}>
                          <td className="px-3 py-2.5 font-semibold text-white text-xs whitespace-nowrap">{sub.studentName}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{sub.controlNumber}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-300 max-w-[160px] truncate" title={sub.practiceTitle}>
                            P{sub.practiceId} · {sub.practiceTitle}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-500">U{sub.unitId}</td>
                          <td className="px-3 py-2.5 text-xs">
                            {sub.repoUrl
                              ? <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline truncate block max-w-[120px]" title={sub.repoUrl}>
                                  {sub.repoUrl.replace('https://github.com/', '')}
                                </a>
                              : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded-full border ${sc.color} ${sc.bg} ${sc.border}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs">
                            {sub.grade != null
                              ? <span className={sub.grade >= 70 ? 'text-green-400' : 'text-red-400'}>{sub.grade}</span>
                              : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('es-MX', { day:'2-digit', month:'short' }) : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <button onClick={() => setSelected(sub)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-800/40 text-blue-300 font-mono text-[10px] transition-colors whitespace-nowrap">
                              ✏️ Revisar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'students' && (
        <Section title={`${students.length} alumnos registrados`}>
          {fetching ? (
            <div className="text-center py-20 text-slate-500 font-mono text-sm">Cargando…</div>
          ) : (
            <div className="rounded-xl border border-[#21262d] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1117] border-b border-[#21262d]">
                    {['Alumno','Control','Correo','Nivel','XP','Entregas','%','Registro'].map(h => (
                      <th key={h} className="text-left font-mono text-xs text-slate-500 px-3 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...students].sort((a, b) => a.name.localeCompare(b.name)).map((st, i) => {
                    const stSubs = studentSubs(st.uid)
                    const pct    = Math.round((stSubs.length / totalPractices) * 100)
                    return (
                      <tr key={st.uid}
                        className={`border-b border-[#21262d] hover:bg-[#161b22] transition-colors ${i % 2 === 1 ? 'bg-[#0a0e16]/40' : ''}`}>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-xs text-white">{st.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{st.controlNumber}</td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">{st.email}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-violet-400">Lv {st.level ?? 1}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-yellow-400">{st.xp ?? 0}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-blue-400">{stSubs.length}/{totalPractices}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-600">
                          {st.setupAt ? new Date(st.setupAt).toLocaleDateString('es-MX', { day:'2-digit', month:'short' }) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {selected && (
        <ReviewModal
          sub={selected}
          teacherName={profile?.name ?? 'Docente'}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); loadData() }}
        />
      )}
    </div>
  )
}

function ReviewModal({
  sub, teacherName, onClose, onSaved,
}: {
  sub: Submission
  teacherName: string
  onClose: () => void
  onSaved: () => void
}) {
  const [status,  setStatus]  = useState<SubmissionStatus>((sub.status ?? 'pending') as SubmissionStatus)
  const [grade,   setGrade]   = useState<number>(sub.grade ?? 0)
  const [comment, setComment] = useState(sub.teacherComment ?? '')
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await reviewSubmission(sub.id, status, grade, comment, teacherName)
    setSaving(false)
    onSaved()
  }

  const sc = STATUS_CONFIG[status]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d] bg-[#161b22]">
          <div>
            <div className="font-bold text-white text-sm">Revisar entrega</div>
            <div className="font-mono text-xs text-slate-500 mt-0.5">
              P{sub.practiceId} · {sub.practiceTitle}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4">

          <div className="rounded-xl bg-[#0a0e16] border border-[#21262d] p-3 grid grid-cols-2 gap-2 text-xs font-mono">
            <div><span className="text-slate-500">Alumno:</span> <span className="text-white">{sub.studentName}</span></div>
            <div><span className="text-slate-500">Control:</span> <span className="text-white">{sub.controlNumber}</span></div>
            <div><span className="text-slate-500">Unidad:</span> <span className="text-blue-400">U{sub.unitId}</span></div>
            <div><span className="text-slate-500">Fecha:</span> <span className="text-slate-300">
              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('es-MX') : '—'}
            </span></div>
          </div>

          {sub.repoUrl && (
            <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-blue-800/30 bg-blue-950/20 px-3 py-2.5 text-blue-300 hover:text-blue-200 text-xs font-mono transition-colors">
              🔗 {sub.repoUrl}
            </a>
          )}

          {sub.notes && (
            <div className="rounded-xl border border-[#21262d] bg-[#0a0e16] px-3 py-2.5">
              <div className="font-mono text-[10px] text-slate-500 mb-1">NOTA DEL ALUMNO</div>
              <p className="text-xs text-slate-300 leading-relaxed">{sub.notes}</p>
            </div>
          )}

          <div>
            <label className="block font-mono text-xs text-slate-400 mb-2">Estado de la entrega</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(STATUS_CONFIG) as [SubmissionStatus, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([s, cfg]) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`rounded-lg px-2 py-2 text-xs font-mono border transition-all ${
                    status === s ? `${cfg.color} ${cfg.bg} ${cfg.border} font-bold` : 'text-slate-500 bg-[#0a0e16] border-[#21262d] hover:border-slate-600'
                  }`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-400 mb-2">
              Calificación (0–100)
              {grade > 0 && <span className={`ml-2 ${grade >= 70 ? 'text-green-400' : 'text-red-400'}`}>{grade >= 70 ? '✓ Aprobado' : '✗ Reprobado'}</span>}
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} step={5} value={grade}
                onChange={e => setGrade(Number(e.target.value))}
                className="flex-1 accent-blue-500" />
              <input type="number" min={0} max={100} value={grade}
                onChange={e => setGrade(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="input-dba w-20 text-center font-mono text-sm" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-400 mb-2">Retroalimentación</label>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Escribe retroalimentación para el alumno…"
              rows={3}
              className="input-dba resize-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-[#21262d] bg-[#0d1117]">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-[#21262d] text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {saving ? <><Spin /> Guardando…</> : '💾 Guardar revisión'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] px-4 py-3">
      <div className={`font-mono font-black text-2xl ${color}`}>{value}</div>
      <div className="font-mono text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-bold text-white text-sm mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Spin() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
}

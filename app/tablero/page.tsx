'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSubmissions, exportSubmissionsCSV } from '@/lib/storage'
import { practices, units, typeBg, typeLabel } from '@/data/curriculum'
import type { Submission } from '@/types'

export default function TablerPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [copied, setCopied]           = useState(false)

  useEffect(() => {
    setSubmissions(getSubmissions().sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ))
  }, [])

  const handleExportCSV = () => {
    const csv = exportSubmissionsCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `scb1001-entregas-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalXP = submissions.reduce((s, sub) => s + sub.xpEarned, 0)
  const submittedIds = new Set(submissions.map(s => s.practiceId))
  const pendingPractices   = practices.filter(p => !submittedIds.has(p.id))
  const desktopPending     = pendingPractices.filter(p => (p as any).mode === 'desktop')
  const playgroundPending  = pendingPractices.filter(p => (p as any).mode === 'playground')

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs text-blue-400 mb-2">TABLERO</div>
          <h1 className="text-3xl font-black text-white">Mis entregas</h1>
          <p className="text-slate-400 mt-1">Historial completo de prácticas entregadas</p>
        </div>
        {submissions.length > 0 && (
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#0d1117] border border-[#21262d] hover:border-blue-700/60 rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            <span>⬇</span> Exportar CSV
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Entregadas', value: submissions.length, sub: `de ${practices.length}`, color: 'text-blue-400' },
          { label: 'XP ganados', value: totalXP.toLocaleString(), sub: 'puntos', color: 'text-yellow-400' },
          { label: 'Pendientes', value: pendingPractices.length, sub: 'prácticas', color: 'text-red-400' },
          { label: 'Completado', value: `${Math.round((submissions.length/practices.length)*100)}%`, sub: 'del curso', color: 'text-green-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
            <div className={`font-mono font-black text-2xl ${color}`}>{value}</div>
            <div className="font-mono text-xs text-slate-600">{sub}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {submissions.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 border border-dashed border-[#21262d] rounded-xl">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-white mb-2">Sin entregas aún</h2>
          <p className="text-slate-400 mb-6">Completa tu primera práctica para verla aquí</p>
          <Link href="/" className="btn-primary inline-block">Ver prácticas disponibles →</Link>
        </div>
      ) : (
        /* Submissions table */
        <div className="rounded-xl border border-[#21262d] overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0d1117] border-b border-[#21262d]">
                  {['Práctica', 'Tipo', 'Repositorio', 'XP', 'Fecha'].map(h => (
                    <th key={h} className="text-left font-mono text-xs text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => {
                  const practice = practices.find(p => p.id === sub.practiceId)
                  return (
                    <tr key={sub.id}
                      className={`border-b border-[#21262d] hover:bg-[#161b22] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0d1117]/50'}`}>
                      <td className="px-4 py-3">
                        <Link href={`/practica/${sub.practiceId}`}
                          className="font-medium text-sm text-slate-200 hover:text-blue-400 transition-colors">
                          {sub.practiceTitle}
                        </Link>
                        {sub.notes && (
                          <div className="font-mono text-xs text-slate-600 mt-0.5 truncate max-w-[220px]">{sub.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {practice && (
                          <span className={`font-mono text-xs px-2 py-0.5 rounded border ${typeBg[practice.type]}`}>
                            {typeLabel[practice.type]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sub.repoUrl ? (
                          <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-400 hover:underline truncate block max-w-[200px]">
                            {sub.repoUrl.replace('https://github.com/', '')}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-yellow-500">+{sub.xpEarned}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">
                          {new Date(sub.submittedAt).toLocaleDateString('es-MX', { day:'2-digit', month:'short' })}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending practices */}
      {pendingPractices.length > 0 && (
        <div>
          <h2 className="font-bold text-white mb-3 flex items-center gap-2">
            <span className="font-mono text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded px-2 py-1">PENDIENTES</span>
            <span className="text-base">{pendingPractices.length} prácticas sin entregar</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {pendingPractices.map(p => {
              const unit = units.find(u => u.id === p.unitId)
              return (
                <Link key={p.id} href={`/practica/${p.id}`}
                  className="flex items-center gap-2.5 bg-[#0d1117] border border-[#21262d] hover:border-blue-700/60 rounded-lg p-3 transition-colors group">
                  <span className={`font-mono text-xs ${
                    p.type === 'sql' ? 'text-blue-500' :
                    p.type === 'java' ? 'text-orange-500' :
                    p.type === 'bash' ? 'text-green-500' : 'text-violet-500'
                  }`}>●</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-300 truncate">{p.title}</div>
                    <div className="font-mono text-xs text-slate-600">{unit?.icon} U{p.unitId} · +{p.xpReward} XP</div>
                  </div>
                  <span className="text-slate-600 group-hover:text-blue-400 transition-colors text-xs">→</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { SQLEditor } from '@/components/SQLEditor'
import { missions, missionUnitColors } from '@/data/missions'
import { getMissionsCompleted } from '@/lib/missionStorage'
import Link from 'next/link'

const SCHEMA_HELP = `/* ═══════════════════════════════════════
   ESQUEMA: escolar_admin (SQLite en browser)
   ═══════════════════════════════════════
   TABLAS:
   • alumnos (40 filas)  • materias (12 filas)
   • inscripciones       • profesores (5 filas)
   • bitacora_accesos    
 ═══════════════════════════════════════ */

SELECT * FROM alumnos LIMIT 10;`

const QUICK: {label:string;sql:string}[] = [
  { label:'📋 Todas las tablas', sql:"SELECT name FROM sqlite_master WHERE type='table';" },
  { label:'👥 Alumnos activos', sql:"SELECT numero_control,nombre,semestre,carrera,promedio FROM alumnos WHERE activo=1 ORDER BY promedio DESC LIMIT 15;" },
  { label:'📊 Por semestre', sql:"SELECT semestre,COUNT(*) AS total FROM alumnos GROUP BY semestre ORDER BY semestre;" },
  { label:'📖 Materias+Profesor', sql:"SELECT m.clave,m.nombre,p.nombre AS profesor\nFROM materias m JOIN profesores p ON m.profesor_id=p.id ORDER BY m.semestre;" },
  { label:'🎓 Inscripciones', sql:"SELECT a.nombre||' '||a.apellido_p AS alumno,m.nombre AS materia,i.calificacion,i.estado\nFROM inscripciones i\nJOIN alumnos a ON i.alumno_id=a.id\nJOIN materias m ON i.materia_id=m.id\nORDER BY i.calificacion DESC NULLS LAST;" },
  { label:'🔒 Bitácora', sql:"SELECT usuario,operacion,exitoso,fecha_hora FROM bitacora_accesos ORDER BY fecha_hora DESC;" },
  { label:'⚡ TOP alumnos', sql:"SELECT nombre,apellido_p,semestre,promedio FROM alumnos WHERE activo=1 ORDER BY promedio DESC LIMIT 5;" },
  { label:'🔍 EXPLAIN', sql:"EXPLAIN QUERY PLAN\nSELECT * FROM alumnos WHERE carrera='ISC' AND semestre=6;" },
]

export default function PlaygroundPage() {
  const [activeSQL, setActiveSQL] = useState(SCHEMA_HELP)
  const [queryKey, setQueryKey]   = useState(0)
  const [completed, setCompleted] = useState<number[]>([])

  useEffect(() => { setCompleted(getMissionsCompleted()) }, [])

  const loadQuery = (sql: string) => {
    setActiveSQL(sql)
    setQueryKey(k => k + 1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-blue-400 bg-blue-950/40 border border-blue-800/30 rounded px-2 py-1">PLAYGROUND</span>
            <span className="font-mono text-xs text-green-500 bg-green-950/30 border border-green-800/30 rounded px-2 py-1">● SQLite en browser</span>
          </div>
          <h1 className="text-3xl font-black text-white">Consola SQL</h1>
          <p className="text-slate-400 mt-1">SQL en tiempo real en el navegador — sin instalar nada.</p>
        </div>
        <Link href="/misiones" className="flex-shrink-0 flex items-center gap-2 bg-yellow-950/30 border border-yellow-800/40 hover:border-yellow-600/60 rounded-xl px-4 py-2.5 transition-colors group">
          <span className="text-xl">⚔️</span>
          <div>
            <div className="text-xs font-bold text-yellow-300">Misiones SQL</div>
            <div className="font-mono text-xs text-yellow-700">{completed.length}/15 completadas</div>
          </div>
          <span className="text-yellow-700 group-hover:text-yellow-400 transition-colors">→</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK.map(q => (
              <button key={q.label} onClick={() => loadQuery(q.sql)}
                className="font-mono text-xs px-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d] text-slate-400 hover:text-white hover:border-blue-700/50 transition-colors">
                {q.label}
              </button>
            ))}
          </div>

          <SQLEditor key={queryKey} initialSQL={activeSQL} height="240px" showHistory={true} />

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon:'⌨️', title:'Ctrl+Enter', desc:'Ejecutar consulta' },
              { icon:'🔄', title:'Reset DB', desc:'Restaurar datos originales' },
              { icon:'📋', title:'Historial', desc:'Últimas 30 consultas' },
            ].map(t => (
              <div key={t.title} className="flex items-center gap-3 bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2.5">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <div className="font-mono text-xs text-slate-300 font-bold">{t.title}</div>
                  <div className="font-mono text-xs text-slate-600">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 text-sm flex-shrink-0">ℹ</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Este playground usa SQLite</strong> (no MySQL). Sintaxis 99% compatible.
                Diferencias: usa <span className="font-mono text-blue-300">sqlite_master</span> en lugar de <span className="font-mono text-blue-300">SHOW TABLES</span>.
                Para replicación, usuarios y TLS necesitas MySQL real en tu servidor.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">MISIONES DISPONIBLES</div>
            <div className="space-y-1.5">
              {missions.map(m => {
                const done = completed.includes(m.id)
                return (
                  <Link key={m.id} href={`/misiones/${m.id}`}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${done ? 'bg-green-950/20 border border-green-800/30' : 'hover:bg-[#161b22] border border-transparent hover:border-[#21262d]'}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: done ? '#22c55e' : missionUnitColors[m.unitId] }} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${done ? 'text-green-400' : 'text-slate-300'}`}>{done && '✓ '}{m.title}</div>
                      <div className="font-mono text-xs text-slate-600">U{m.unitId} · {m.subtitle}</div>
                    </div>
                    <span className="font-mono text-xs text-yellow-600">+{m.xpReward}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-2">TABLAS DEL ESQUEMA</div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                ['alumnos','40 filas','id, numero_control, nombre, semestre, carrera, promedio'],
                ['materias','12 filas','id, clave, nombre, creditos, semestre'],
                ['inscripciones','24 filas','alumno_id, materia_id, calificacion, estado'],
                ['profesores','5 filas','id, nombre, departamento, email'],
                ['bitacora_accesos','14 filas','usuario, operacion, exitoso, fecha_hora'],
              ].map(([table, count, cols]) => (
                <div key={table} className="border border-[#21262d] rounded p-2 hover:border-blue-800/40 transition-colors cursor-pointer" onClick={() => loadQuery(`SELECT * FROM ${table} LIMIT 5;`)}>
                  <div className="flex justify-between">
                    <span className="text-blue-400">{table}</span>
                    <span className="text-slate-600">{count}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5 truncate">{cols}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
